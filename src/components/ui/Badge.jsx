export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'border-zinc-700 bg-zinc-800 text-zinc-300',
    green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    red: 'border-red-400/30 bg-red-400/10 text-red-200',
  };

  return (
    <span className={['inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold', tones[tone], className].join(' ')}>
      {children}
    </span>
  );
}
