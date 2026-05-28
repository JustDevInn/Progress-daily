import { Pause, Play, RotateCcw, Square } from 'lucide-react';
import { Button } from '../ui/Button';

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function RestTimer({ timer, progress, onPause, onResume, onReset, onAdjust, onStop }) {
  const active = timer.running || timer.secondsLeft > 0 || timer.finished;

  return (
    <section className={['sticky top-0 z-30 border-b px-4 py-3 backdrop-blur', active ? 'border-emerald-400/25 bg-zinc-950/96' : 'border-zinc-800 bg-zinc-950/92'].join(' ')}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Rusttimer</p>
          <p className="truncate text-sm font-bold text-zinc-200">
            {timer.finished ? 'Rust klaar' : timer.label || 'Klaar voor je volgende set'}
          </p>
        </div>
        <div className="text-right">
          <div className={['text-3xl font-black tabular-nums', timer.finished ? 'text-emerald-300' : 'text-zinc-50'].join(' ')}>
            {formatSeconds(timer.secondsLeft)}
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {timer.running ? (
          <Button variant="secondary" size="sm" onClick={onPause} className="px-2">
            <Pause size={16} />
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={onResume} disabled={!timer.secondsLeft} className="px-2">
            <Play size={16} />
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => onAdjust(-30)} disabled={!timer.totalSeconds} className="px-2">
          -30
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAdjust(30)} disabled={!timer.totalSeconds} className="px-2">
          +30
        </Button>
        <Button variant="ghost" size="sm" onClick={onStop} disabled={!timer.totalSeconds} className="px-2">
          <Square size={15} />
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
        <Button variant="ghost" size="sm" onClick={onReset} disabled={!timer.totalSeconds}>
          <RotateCcw size={16} />
          Reset
        </Button>
        <div className="flex items-center justify-center rounded-md bg-zinc-900 text-xs font-semibold text-zinc-400">
          {timer.finished ? 'Klaar' : timer.running ? 'Loopt' : timer.secondsLeft ? 'Gepauzeerd' : 'Rust'}
        </div>
      </div>
    </section>
  );
}
