const DURATIONS = Array.from({ length: 13 }, (_, index) => index + 3);

export default function DurationSelector({ value, onChange }) {
  return (
    <section className="mt-7" aria-labelledby="duration-title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="duration-title" className="text-xl font-bold">Clip duration</h2>
        <span className="rounded-full border border-white/12 px-3 py-1 text-sm text-cyan">{value}s</span>
      </div>
      <input
        aria-label="Clip duration in seconds"
        className="h-2 w-full accent-cyan"
        min="3"
        max="15"
        step="1"
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-4 flex flex-wrap gap-[10px]">
        {DURATIONS.map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() => onChange(duration)}
            className={`rounded-full px-4 py-[10px] text-sm font-semibold transition hover:scale-[1.03] ${
              value === duration
                ? "bg-gradient-to-r from-cyan to-violet text-night shadow-glow"
                : "border border-white/12 text-muted hover:border-cyan/60 hover:text-white"
            }`}
          >
            {duration}s
          </button>
        ))}
      </div>
    </section>
  );
}
