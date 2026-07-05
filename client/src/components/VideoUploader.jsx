import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileVideo, UploadCloud, Wand2 } from "lucide-react";
import DurationSelector from "./DurationSelector";
import ProgressPanel from "./ProgressPanel";
import ClipGrid from "./ClipGrid";
import ErrorMessage from "./ErrorMessage";
import { splitVideoOnServer } from "../utils/serverVideoService";
import { downloadClipsZip } from "../utils/zipUtils";
import {
  calculateClipCount,
  formatDuration,
  formatFileSize,
  getProcessingWarning,
  isBrowserSupported,
  readVideoMetadata,
  validateFileSize,
  validateFileType,
  validateVideoDuration
} from "../utils/videoUtils";
import { trackEvent } from "../utils/analytics";

const initialProgress = { stage: "Uploading", percent: 0, currentClip: 0, totalClips: 0, remainingMs: 0 };

export default function VideoUploader() {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [clipDuration, setClipDuration] = useState(3);
  const [error, setError] = useState("");
  const [clips, setClips] = useState([]);
  const [zipUrl, setZipUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const splitRequestRef = useRef(null);

  const clipCount = useMemo(() => calculateClipCount(duration, clipDuration), [duration, clipDuration]);
  const warning = file && duration ? getProcessingWarning(file.size, clipCount, duration) : "";

  async function handleFile(nextFile) {
    setError("");
    clearClips();

    if (!isBrowserSupported()) {
      setError("Your browser does not support this tool. Please use the latest version of Chrome, Edge, or Firefox.");
      return;
    }
    if (!validateFileType(nextFile)) {
      setError("Unsupported file type. Please upload MP4, MOV, WEBM, or MKV.");
      return;
    }
    if (!validateFileSize(nextFile)) {
      setError("Your video is too large. Please use a video under 1GB or compress the video first.");
      return;
    }

    try {
      const metadata = await readVideoMetadata(nextFile);
      if (!validateVideoDuration(metadata.duration)) {
        setError("This video is too long. Please use a video under 30 minutes for best results.");
        return;
      }
      setFile(nextFile);
      setDuration(metadata.duration);
      trackEvent("video_uploaded", { size: nextFile.size, duration: metadata.duration });
    } catch {
      setError("We could not read this video. Please try another file or convert it to MP4.");
    }
  }

  async function handleSplit() {
    if (!file || !duration) return;
    setError("");
    setIsProcessing(true);
    setProgress({ ...initialProgress, totalClips: clipCount });
    clearClips();
    trackEvent("split_started", { clip_count: clipCount, clip_duration: clipDuration });

    try {
      const request = splitVideoOnServer({
        file,
        duration: clipDuration,
        onProgress: setProgress
      });
      splitRequestRef.current = request;
      const output = await request.promise;
      const serverClips = output.clips.map((clip, index) => ({
        ...clip,
        duration: Math.min(clipDuration, Math.max(0, duration - index * clipDuration))
      }));
      setClips(serverClips);
      setZipUrl(output.zipUrl);
      trackEvent("split_completed", { clip_count: serverClips.length, clip_duration: clipDuration });
    } catch (err) {
      const message = err.message || "Video splitting failed. Please try again with MP4 format or choose a longer clip duration.";
      setError(message);
      trackEvent(message.includes("cancelled") ? "split_cancelled" : "error_occurred", { message });
    } finally {
      splitRequestRef.current = null;
      setIsProcessing(false);
    }
  }

  function clearClips() {
    setClips([]);
    setZipUrl("");
  }

  function clearProject() {
    clearClips();
    setFile(null);
    setDuration(0);
    setProgress(initialProgress);
    setError("");
  }

  async function handleZip() {
    try {
      downloadClipsZip(zipUrl);
      trackEvent("zip_downloaded", { clip_count: clips.length });
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCancel() {
    splitRequestRef.current?.cancel();
  }

  return (
    <section id="upload-tool" className="app-container pb-16" aria-labelledby="upload-title">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass mt-7 rounded-[22px] p-5 md:mt-10 md:rounded-[28px] md:p-8"
      >
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="upload-title" className="text-2xl font-bold md:text-3xl">Video splitter tool</h2>
          <p className="mt-2 text-sm text-muted">Processing speed depends on upload speed, video size, codec, and server load.</p>
          </div>
          <p className="text-sm text-muted">Best on a stable internet connection.</p>
        </div>

        <label
          className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/25 p-7 text-center transition hover:border-cyan/70 md:min-h-[260px]"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const dropped = event.dataTransfer.files?.[0];
            if (dropped) handleFile(dropped);
          }}
        >
          <input
            className="sr-only"
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mkv"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) handleFile(selected);
            }}
          />
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-cyan">
            <UploadCloud size={30} aria-hidden="true" />
          </span>
          <span className="text-lg font-bold">Upload or drop a video</span>
          <span className="max-w-xl text-sm text-muted">MP4, MOV, WEBM, and MKV. Hard limit: 1GB and 30 minutes.</span>
        </label>

        {file && (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["File", file.name],
              ["Size", formatFileSize(file.size)],
              ["Duration", formatDuration(duration)],
              ["Estimated clips", String(clipCount)]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
                <p className="text-xs uppercase text-muted">{label}</p>
                <p className="mt-2 break-words font-semibold">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-white/12 bg-white/[0.035] p-4 text-sm text-muted">
          <div className="mb-2 flex items-center gap-2 font-semibold text-white">
            <FileVideo size={18} className="text-cyan" aria-hidden="true" /> Processing
          </div>
          <p>Your browser uploads the video, then the server splits it with native FFmpeg and prepares a ZIP download.</p>
        </div>

        <DurationSelector value={clipDuration} onChange={setClipDuration} />

        {warning && (
          <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            {warning}
          </div>
        )}

        <ErrorMessage message={error} />
        <ProgressPanel progress={progress} isProcessing={isProcessing} onCancel={handleCancel} />

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          onClick={handleSplit}
          disabled={!file || isProcessing}
          className="mt-7 inline-flex h-[50px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan to-violet font-bold text-night shadow-glow disabled:cursor-not-allowed disabled:opacity-50 md:h-14"
        >
          <Wand2 size={20} aria-hidden="true" />
          Split Video
        </motion.button>
      </motion.div>

      <ClipGrid clips={clips} onZip={handleZip} onClear={clearProject} />
    </section>
  );
}
