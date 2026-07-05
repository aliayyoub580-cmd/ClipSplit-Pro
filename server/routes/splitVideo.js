const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawn } = require("child_process");
const EventEmitter = require("events");

const archiver = require("archiver");
const express = require("express");
const multer = require("multer");

const router = express.Router();

const TEMP_ROOT = path.join(os.tmpdir(), "clipsplit-pro");
const UPLOAD_DIR = path.join(TEMP_ROOT, "uploads");
const JOB_TTL_MS = 60 * 60 * 1000;
const ZIP_CLEANUP_DELAY_MS = 60 * 1000;
const MAX_UPLOAD_BYTES = Number(process.env.MAX_VIDEO_UPLOAD_BYTES || 1024 * 1024 * 1024);
const ACCEPTED_EXTENSIONS = new Set([".mp4", ".mov", ".webm", ".mkv"]);
const ACCEPTED_MIME_PREFIX = "video/";
const jobs = new Map();
const progressBus = new EventEmitter();
let ffmpegCommand;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const looksLikeVideo = file.mimetype?.startsWith(ACCEPTED_MIME_PREFIX) || ACCEPTED_EXTENSIONS.has(extension);
    if (!looksLikeVideo) {
      callback(new UploadError("Unsupported video format. Please upload MP4, MOV, WEBM, or MKV.", 415));
      return;
    }
    callback(null, true);
  }
});

router.get("/split-video/events/:jobId", (req, res) => {
  const jobId = sanitizeJobId(req.params.jobId);
  if (!jobId) {
    res.status(400).json({ error: "Invalid job id." });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (payload) => {
    if (payload.jobId === jobId) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };

  progressBus.on("progress", send);
  publishProgress(jobId, "Uploading", 1);

  req.on("close", () => {
    progressBus.off("progress", send);
  });
});

router.post("/split-video", upload.single("video"), async (req, res, next) => {
  const jobId = sanitizeJobId(req.body.jobId) || crypto.randomUUID();
  const clipDuration = Number(req.body.duration);
  let jobDir;

  try {
    if (!Number.isInteger(clipDuration) || clipDuration < 3 || clipDuration > 15) {
      throw new UploadError("Clip duration must be a whole number from 3 to 15 seconds.", 400);
    }
    if (!req.file) {
      throw new UploadError("Please upload a video file.", 400);
    }

    jobDir = path.join(TEMP_ROOT, "jobs", jobId);
    const clipsDir = path.join(jobDir, "clips");
    await fsp.mkdir(clipsDir, { recursive: true });

    const extension = path.extname(req.file.originalname || ".mp4") || ".mp4";
    const inputPath = path.join(jobDir, `input${extension}`);
    await fsp.rename(req.file.path, inputPath);

    publishProgress(jobId, "Splitting", 35);
    await runFfmpegSegment({ inputPath, clipsDir, clipDuration, jobId });

    const clipFiles = (await fsp.readdir(clipsDir))
      .filter((name) => /^clip-\d{3,}\.mp4$/i.test(name))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    if (!clipFiles.length) {
      throw new UploadError("FFmpeg did not generate clips. The video may be unsupported or damaged.", 422);
    }

    publishProgress(jobId, "Creating ZIP", 88);
    const zipPath = path.join(jobDir, "clipsplit-output.zip");
    await createZip(clipsDir, clipFiles, zipPath);

    const clipUrls = clipFiles.map((name, index) => ({
      id: name,
      name,
      number: index + 1,
      duration: clipDuration,
      url: `/api/split-video/jobs/${jobId}/clips/${encodeURIComponent(name)}`
    }));

    jobs.set(jobId, {
      jobId,
      jobDir,
      clipsDir,
      zipPath,
      expiresAt: Date.now() + JOB_TTL_MS,
      cleanupTimer: setTimeout(() => cleanupJob(jobId), JOB_TTL_MS)
    });

    publishProgress(jobId, "Completed", 100);
    res.json({
      jobId,
      clips: clipUrls,
      zipUrl: `/api/split-video/jobs/${jobId}/zip`,
      expiresInSeconds: Math.round(JOB_TTL_MS / 1000)
    });
  } catch (error) {
    if (req.file?.path) await fsp.unlink(req.file.path).catch(() => {});
    if (jobDir) await fsp.rm(jobDir, { recursive: true, force: true }).catch(() => {});
    publishProgress(jobId, "Error", 0, normalizeError(error).message);
    next(normalizeError(error));
  }
});

router.get("/split-video/jobs/:jobId/clips/:filename", async (req, res, next) => {
  try {
    const job = getJob(req.params.jobId);
    const filename = path.basename(req.params.filename);
    if (!/^clip-\d{3,}\.mp4$/i.test(filename)) throw new UploadError("Clip not found.", 404);
    res.download(path.join(job.clipsDir, filename), filename);
  } catch (error) {
    next(normalizeError(error));
  }
});

router.get("/split-video/jobs/:jobId/zip", async (req, res, next) => {
  try {
    const job = getJob(req.params.jobId);
    res.download(job.zipPath, "clipsplit-output.zip", (error) => {
      if (error) return;
      setTimeout(() => cleanupJob(job.jobId), ZIP_CLEANUP_DELAY_MS);
    });
  } catch (error) {
    next(normalizeError(error));
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    next(new UploadError("Video is too large. Please upload a file under 1GB.", 413));
    return;
  }
  if (error.code === "ENOSPC" || /no space left/i.test(error.message || "")) {
    next(new UploadError("Server disk space is full. Please try again later.", 507));
    return;
  }
  next(error);
});

function runFfmpegSegment({ inputPath, clipsDir, clipDuration, jobId }) {
  return new Promise((resolve, reject) => {
    const outputPattern = path.join(clipsDir, "clip-%03d.mp4");
    const args = [
      "-i",
      inputPath,
      "-c",
      "copy",
      "-map",
      "0",
      "-segment_time",
      String(clipDuration),
      "-f",
      "segment",
      "-reset_timestamps",
      "1",
      outputPattern
    ];

    const ffmpeg = spawn(resolveFfmpegCommand(), args, {
      windowsHide: true
    });

    let stderr = "";
    let progressTick = 35;
    const progressTimer = setInterval(() => {
      progressTick = Math.min(82, progressTick + 4);
      publishProgress(jobId, "Splitting", progressTick);
    }, 1000);

    ffmpeg.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on("error", (error) => {
      clearInterval(progressTimer);
      if (error.code === "ENOENT") {
        reject(new UploadError(nativeFfmpegMissingMessage(), 500));
        return;
      }
      reject(error);
    });

    ffmpeg.on("close", (code) => {
      clearInterval(progressTimer);
      if (code === 0) {
        publishProgress(jobId, "Splitting", 85);
        resolve();
        return;
      }
      reject(ffmpegError(stderr));
    });
  });
}

function resolveFfmpegCommand() {
  if (ffmpegCommand) return ffmpegCommand;

  const configuredPath = process.env.FFMPEG_PATH?.trim();
  if (configuredPath) {
    ffmpegCommand = configuredPath;
    return ffmpegCommand;
  }

  ffmpegCommand = findWindowsFfmpeg() || "ffmpeg";
  return ffmpegCommand;
}

function findWindowsFfmpeg() {
  if (process.platform !== "win32") return "";

  const candidateFiles = [
    path.join(__dirname, "..", "..", ".tools", "ffmpeg", "ffmpeg.exe"),
    path.join(__dirname, "..", "..", ".tools", "ffmpeg", "bin", "ffmpeg.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Links", "ffmpeg.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WindowsApps", "ffmpeg.exe")
  ];

  for (const candidate of candidateFiles) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }

  const packageRoot = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages");
  return findFile(path.join(__dirname, "..", "..", ".tools", "ffmpeg"), "ffmpeg.exe", 6)
    || findFile(packageRoot, "ffmpeg.exe", 5);
}

function findFile(rootDir, filename, maxDepth) {
  if (!rootDir || maxDepth < 0) return "";

  let entries;
  try {
    entries = fs.readdirSync(rootDir, { withFileTypes: true });
  } catch (error) {
    return "";
  }

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === filename) return entryPath;
    if (entry.isDirectory()) {
      const foundPath = findFile(entryPath, filename, maxDepth - 1);
      if (foundPath) return foundPath;
    }
  }

  return "";
}

function nativeFfmpegMissingMessage() {
  if (process.platform !== "win32") {
    return "Native FFmpeg is not installed or not available in PATH.";
  }
  return "Native FFmpeg is not installed or not available to this server process. Install it with `winget install Gyan.FFmpeg`, restart the server, or set FFMPEG_PATH to ffmpeg.exe.";
}

function createZip(clipsDir, clipFiles, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 0 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);
    archive.pipe(output);
    clipFiles.forEach((filename) => {
      archive.file(path.join(clipsDir, filename), { name: filename });
    });
    archive.finalize();
  });
}

function publishProgress(jobId, stage, percent, error) {
  progressBus.emit("progress", { jobId, stage, percent, error });
}

function sanitizeJobId(jobId) {
  if (typeof jobId !== "string") return "";
  return /^[a-zA-Z0-9_-]{8,80}$/.test(jobId) ? jobId : "";
}

function getJob(jobId) {
  const safeJobId = sanitizeJobId(jobId);
  const job = safeJobId ? jobs.get(safeJobId) : null;
  if (!job) throw new UploadError("Generated clips have expired or were already cleaned up.", 404);
  return job;
}

function cleanupJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;
  clearTimeout(job.cleanupTimer);
  jobs.delete(jobId);
  fsp.rm(job.jobDir, { recursive: true, force: true }).catch(() => {});
}

function ffmpegError(stderr) {
  if (/no space left|disk full|enospc/i.test(stderr)) {
    return new UploadError("Server disk space is full. Please try again later.", 507);
  }
  if (/invalid data|moov atom not found|could not find codec|unsupported/i.test(stderr)) {
    return new UploadError("Unsupported or damaged video. Please try another MP4, MOV, WEBM, or MKV file.", 422);
  }
  return new UploadError("FFmpeg failed while splitting this video. Please try another video or duration.", 500);
}

function normalizeError(error) {
  if (error instanceof UploadError) return error;
  if (/ENOSPC|no space left/i.test(error.message || "")) {
    return new UploadError("Server disk space is full. Please try again later.", 507);
  }
  return error;
}

class UploadError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = router;
