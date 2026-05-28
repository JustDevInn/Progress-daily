import { AlertTriangle, Award, Dumbbell, Moon } from 'lucide-react';
import { InsightCard } from '../components/insights/InsightCard';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { insightMetrics } from '../utils/calculations';
import { formatShortDate } from '../utils/date';

export function InsightsPage({ sessions }) {
  const metrics = insightMetrics(sessions);
  const readinessTone = metrics.readiness >= 8 ? 'green' : metrics.readiness <= 5 ? 'red' : 'amber';

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pb-5 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-50">Inzicht</h1>
      </header>
      <div className="space-y-4 px-4">
        <LatestSessionCard metrics={metrics} />

        <div className="grid grid-cols-2 gap-3">
          <InsightCard title="Deze week" value={metrics.weekCount} meta="trainingen" />
          <InsightCard title="Deze maand" value={metrics.monthCount} meta="sessies" />
          <InsightCard title="Hard sets" value={metrics.weeklyHardSets} meta="deze week" />
          <InsightCard title="Weekvolume" value={metrics.weeklyVolume} meta="kg" />
          <InsightCard
            title="Gem. inspanning"
            value={metrics.weeklyAverageEffort === null ? '-' : `${metrics.weeklyAverageEffort}%`}
            meta={metrics.weeklyAverageEffort === null ? 'Meer RIR-data nodig' : 'deze week'}
          />
          <InsightCard title="Hoge inspanning" value={metrics.weeklyHighEffortSets} meta="sets boven 90%" />
          <InsightCard title="MAX sets" value={metrics.weeklyMaxSets} meta="failure / max" />
        </div>

        <InsightCard title="Readiness" value={`${metrics.readiness}/10`} tone={readinessTone} meta="laatste recovery check" />

        <MuscleGroupCard rows={metrics.muscleRows} />
        <RecoveryCard text={metrics.recoveryRelation} />
        <PrCard prs={metrics.prs} />
        <AttentionCard points={metrics.attentionPoints} />
      </div>
    </div>
  );
}

function LatestSessionCard({ metrics }) {
  const session = metrics.latestTraining;
  const latest = metrics.latestMetrics;
  if (!session || !latest) {
    return <InsightCard title="Laatste training" value="Geen" meta="Nog geen sessie" />;
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Laatste training</p>
          <h2 className="mt-1 text-xl font-black text-zinc-50">{session.programName}</h2>
          <p className="mt-1 text-sm text-zinc-400">{formatShortDate(session.date)}</p>
        </div>
        <Badge tone={latest.maxSets ? 'amber' : 'green'}>{latest.maxSets} MAX</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SmallStat label="Oef." value={latest.exercises} />
        <SmallStat label="Sets" value={latest.sets} />
        <SmallStat label="Insp." value={latest.averageEffort === null ? '-' : `${latest.averageEffort}%`} />
      </div>
      <p className="rounded-md bg-zinc-950 px-3 py-2 text-sm text-zinc-400">
        Volume {latest.volume}kg · {latest.highEffortSets} sets boven 90% inspanning
      </p>
      <div className="flex flex-wrap gap-2">
        {['sleepQuality', 'energyLevel', 'recoveryLevel', 'stressLevel', 'painLevel'].map((key) => (
          session.recovery?.[key] ? (
            <span key={key} className="rounded-md bg-zinc-950 px-2 py-1 text-xs font-bold text-zinc-400">
              {session.recovery[key]}
            </span>
          ) : null
        ))}
      </div>
    </Card>
  );
}

function MuscleGroupCard({ rows }) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Dumbbell size={18} className="text-emerald-300" />
        <h2 className="font-black text-zinc-50">Spiergroepen deze week</h2>
      </div>
      <div className="space-y-3">
        {rows.length ? (
          rows.slice(0, 8).map((row) => (
            <div key={row.group} className="rounded-md bg-zinc-950 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-200">{row.group}</span>
                <span className="text-xs text-zinc-500">{row.volume}kg</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <span className="text-zinc-400">{row.hardSets} hard sets</span>
                <span className="text-right text-zinc-400">{row.reps} reps</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-400">Geen sessies deze week.</p>
        )}
      </div>
    </Card>
  );
}

function RecoveryCard({ text }) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Moon size={18} className="text-emerald-300" />
        <h2 className="font-black text-zinc-50">Herstelanalyse</h2>
      </div>
      <p className="text-sm leading-6 text-zinc-300">{text}</p>
    </Card>
  );
}

function PrCard({ prs }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-emerald-300" />
          <h2 className="font-black text-zinc-50">PR's</h2>
        </div>
        <Badge tone="green">recent</Badge>
      </div>
      <div className="space-y-2">
        {prs.length ? (
          prs.map((pr, index) => (
            <div key={`${pr.name}-${pr.date}-${index}`} className="rounded-md bg-zinc-950 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-100">{pr.name}</p>
                  <p className="text-xs text-zinc-500">{formatShortDate(pr.date)} · {pr.best}</p>
                </div>
                <span className="shrink-0 font-black text-emerald-300">{pr.oneRm ? `${pr.oneRm}kg` : `${pr.volume}kg`}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {pr.badges.map((badge) => (
                  <Badge key={badge} tone={badge === 'Volume PR' ? 'neutral' : 'green'}>
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-400">Nog geen PR data.</p>
        )}
      </div>
    </Card>
  );
}

function AttentionCard({ points }) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={18} className="text-amber-300" />
        <h2 className="font-black text-zinc-50">Mogelijke aandachtspunten</h2>
      </div>
      <div className="space-y-2">
        {points.map((point) => (
          <p key={point} className="rounded-md bg-zinc-950 px-3 py-2 text-sm leading-5 text-zinc-300">
            {point}
          </p>
        ))}
      </div>
    </Card>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-md bg-zinc-950 px-2 py-2">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 font-black text-zinc-100">{value}</p>
    </div>
  );
}
