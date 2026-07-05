import { formatDuration } from "../utils/videoUtils";

export default function ProgressPanel({ progress, onCancel, isProcessing }) {
  if (!isProcessing) return null;
  const stage = progress.stage || "Processing";
  const showClipCount = progress.totalClips > 0;
  return (
    <section className="mt-7 rounded-3xl border border-white/12 bg-white/[0.04] p-5" aria-live="polite">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">{stage}</h2>
          <p className="text-sm text-muted">
            {showClipCount ? `Clip ${progress.currentClip} of ${progress.totalClips}` : "Preparing your video"}
          </p>
        </div>
        <p className="text-sm text-muted">Estimated remaining: {formatDuration((progress.remainingMs || 0) / 1000)}</p>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-white/10">
        <div
          className="progress-shine relative h-full rounded-full bg-gradient-to-r from-cyan to-violet transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold">{progress.percent}%</span>
        <button type="button" onClick={onCancel} className="rounded-xl border border-white/12 px-4 py-2 text-sm font-semibold hover:border-red-300 hover:text-red-200">
          Cancel
        </button>
      </div>
    </section>
  );
}
