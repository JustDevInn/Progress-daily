import { Pause, Play, Square } from 'lucide-react';

function formatSeconds(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function RestTimer({
  timer,
  manualSeconds = 120,
  onStartDefault,
  onPause,
  onResume,
  onAdjust,
  onStop,
}) {
  const active = timer.running || timer.secondsLeft > 0 || timer.finished;
  const canResume = (timer.secondsLeft > 0 || (timer.finished && timer.totalSeconds > 0)) && !timer.running;
  const time = active ? timer.secondsLeft : manualSeconds;
  const panelClass = active
    ? 'border-emerald-400/35 bg-zinc-900/95'
    : 'border-emerald-400/20 bg-zinc-900/95';

  if (!active) {
    return (
      <section className={['rounded-xl border p-2 shadow-lg shadow-black/30 backdrop-blur', panelClass].join(' ')}>
        <div className="grid min-h-14 grid-cols-[1fr_auto] items-center gap-2">
          <div className="min-w-0 px-1">
            <p className="truncate text-sm font-black text-zinc-100">Start timer</p>
            <p className="text-xs font-semibold tabular-nums text-zinc-500">{formatSeconds(time)}</p>
          </div>
          <button
            type="button"
            onClick={onStartDefault}
            className="flex h-11 min-w-28 items-center justify-center gap-2 rounded-md bg-emerald-400 px-3 text-sm font-black text-zinc-950"
            aria-label="Start rusttimer"
          >
            <Play size={17} fill="currentColor" />
            Start
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={['rounded-xl border p-2 shadow-lg shadow-black/30 backdrop-blur', panelClass].join(' ')}>
      <div className="grid min-h-14 grid-cols-[minmax(5.5rem,1fr)_auto_auto_auto_auto] items-center gap-1.5">
        <p className="min-w-0 px-1 text-3xl font-black leading-none tabular-nums text-zinc-50">
          {formatSeconds(time)}
        </p>
        <button
          type="button"
          onClick={() => onAdjust(-30)}
          disabled={!timer.totalSeconds}
          className="hidden h-10 min-w-11 items-center justify-center rounded-md bg-zinc-950 px-2 text-xs font-black text-zinc-300 disabled:opacity-45 min-[380px]:flex"
        >
          -30
        </button>
        <button
          type="button"
          onClick={timer.running ? onPause : onResume}
          disabled={!timer.running && !canResume}
          className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400 text-zinc-950 disabled:opacity-45"
          aria-label={timer.running ? 'Pauzeer timer' : 'Start timer'}
        >
          {timer.running ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
        </button>
        <button
          type="button"
          onClick={onStop}
          className="flex h-11 w-11 items-center justify-center rounded-md bg-zinc-950 text-zinc-50"
          aria-label="Stop timer"
        >
          <Square size={16} />
        </button>
        <button
          type="button"
          onClick={() => onAdjust(30)}
          disabled={!timer.totalSeconds}
          className="hidden h-10 min-w-11 items-center justify-center rounded-md bg-zinc-950 px-2 text-xs font-black text-zinc-300 disabled:opacity-45 min-[380px]:flex"
        >
          +30
        </button>
      </div>
    </section>
  );
}
