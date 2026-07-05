import { motion } from "framer-motion";
import { Download, Package, RotateCcw, Trash2 } from "lucide-react";
import { formatDuration } from "../utils/videoUtils";

export default function ClipGrid({ clips, onZip, onClear }) {
  if (!clips.length) return null;

  return (
    <section className="mt-10" aria-labelledby="clips-title">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="clips-title" className="text-2xl font-bold">Output clips</h2>
          <p className="mt-1 text-sm text-muted">{clips.length} clips generated</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onZip} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-violet px-4 py-3 text-sm font-bold text-night hover:scale-[1.03]">
            <Package size={18} aria-hidden="true" /> Download all as ZIP
          </button>
          <button type="button" onClick={onClear} className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-semibold text-muted hover:text-white">
            <Trash2 size={18} aria-hidden="true" /> Clear project
          </button>
          <a href="#upload-tool" className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-semibold text-muted hover:text-white">
            <RotateCcw size={18} aria-hidden="true" /> Start again
          </a>
        </div>
      </div>
      {clips.length > 200 && (
        <p className="mb-5 rounded-2xl border border-yellow-300/30 bg-yellow-400/10 p-4 text-sm text-yellow-100">
          Download clips in batches if you generated a very large number of files.
        </p>
      )}
      <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.045 } } }}>
        {clips.map((clip) => (
          <motion.article
            key={clip.id}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
            className="glass rounded-[20px] p-4"
          >
            <video className="aspect-video w-full rounded-2xl bg-black object-contain" src={clip.url} controls preload="metadata" aria-label={`Preview clip ${clip.number}`} />
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold">Clip {clip.number}</h3>
                <p className="text-sm text-muted">{formatDuration(clip.duration)}</p>
              </div>
              <a
                href={clip.url}
                download={clip.name}
                className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 text-cyan hover:border-cyan"
                aria-label={`Download clip ${clip.number}`}
                title={`Download clip ${clip.number}`}
              >
                <Download size={18} aria-hidden="true" />
              </a>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
