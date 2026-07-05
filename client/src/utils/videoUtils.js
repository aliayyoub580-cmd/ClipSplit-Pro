export const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024;
export const MAX_VIDEO_DURATION_SECONDS = 30 * 60;
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska"];
export const ACCEPTED_EXTENSIONS = [".mp4", ".mov", ".webm", ".mkv"];

export function calculateClipCount(videoDuration, clipDuration) {
  if (!Number.isFinite(videoDuration) || !Number.isFinite(clipDuration) || clipDuration <= 0) return 0;
  return Math.ceil(videoDuration / clipDuration);
}

export function formatFileSize(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatDuration(seconds = 0) {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function validateFileType(file) {
  if (!file) return false;
  const lowerName = file.name.toLowerCase();
  return ACCEPTED_VIDEO_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export function validateFileSize(file) {
  return Boolean(file && file.size <= MAX_FILE_SIZE_BYTES);
}

export function validateVideoDuration(duration) {
  return Number.isFinite(duration) && duration > 0 && duration <= MAX_VIDEO_DURATION_SECONDS;
}

export function generateClipFilename(index) {
  return `clip-${String(index + 1).padStart(3, "0")}.mp4`;
}

export function estimateProcessingRisk(fileSize, clipCount, duration) {
  if (fileSize > 800 * 1024 * 1024 || clipCount > 300 || duration > 20 * 60) return "high";
  if (fileSize > 500 * 1024 * 1024 || clipCount > 200 || duration > 10 * 60) return "medium";
  return "low";
}

export function getProcessingWarning(fileSize, clipCount, duration) {
  const risk = estimateProcessingRisk(fileSize, clipCount, duration);
  if (clipCount > 300) {
    return "This will generate many output files. Please choose a longer clip duration or use a shorter video.";
  }
  if (clipCount > 200) {
    return "This video will generate many clips. Upload, splitting, and ZIP creation may take longer.";
  }
  if (risk === "high") {
    return "This is a large processing job. Consider a longer clip duration or a smaller source video.";
  }
  if (risk === "medium") {
    return "This video may take longer to upload and split.";
  }
  return "";
}

export function readVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("metadata"));
        return;
      }
      resolve({ duration });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("metadata"));
    };

    video.src = url;
  });
}

export function isBrowserSupported() {
  return Boolean(window.File && window.Blob && window.URL && window.Worker && WebAssembly);
}
