import { Card } from '../ui/Card';

export function InsightCard({ title, value, meta, tone = 'neutral', children }) {
  const tones = {
    neutral: 'text-zinc-50',
    green: 'text-emerald-300',
    amber: 'text-amber-300',
    red: 'text-red-300',
  };

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      {value !== undefined && <div className={`mt-2 text-2xl font-black ${tones[tone]}`}>{value}</div>}
      {meta && <p className="mt-1 text-sm text-zinc-400">{meta}</p>}
      {children && <div className="mt-3">{children}</div>}
    </Card>
  );
}
