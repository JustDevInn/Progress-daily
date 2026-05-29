import { Minus, Save, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import { format, isSameMonth, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { ExerciseChart } from '../components/progress/ExerciseChart';
import { ProgressFilters } from '../components/progress/ProgressFilters';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  buildExerciseHistory,
  compareLatest,
  completedSessions,
  formatSetPerformance,
  byCompletedDesc,
} from '../utils/calculations';
import { formatShortDate } from '../utils/date';

export function ProgressPage({ programs, sessions, onUpdateSession, onDeleteSession }) {
  const [exerciseId, setExerciseId] = useState('all');
  const [programId, setProgramId] = useState('all');
  const [metric, setMetric] = useState('weight');
  const exercises = useMemo(() => {
    const map = new Map();
    programs
      .filter((program) => programId === 'all' || program.id === programId)
      .forEach((program) => program.exercises.forEach((exercise) => map.set(exercise.id, exercise)));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [programs, programId]);
  const selectedExercise = exercises.find((exercise) => exercise.id === exerciseId);
  const hasSelectedExercise = exerciseId !== 'all' && Boolean(selectedExercise);
  const history = useMemo(
    () => (hasSelectedExercise ? buildExerciseHistory(sessions, exerciseId, programId, programs) : []),
    [hasSelectedExercise, sessions, exerciseId, programId, programs],
  );
  const validHistory = hasSelectedExercise ? history.filter(hasExerciseMeasurement) : [];
  const comparison = compareLatest(validHistory.filter(hasComparisonData));
  const currentMetric = {
    weight: { title: 'Gewicht', unit: 'kg', key: 'weight' },
    reps: { title: 'Reps', unit: 'totaal', key: 'reps' },
    effort: { title: 'Inspanning', unit: '%', key: 'effort' },
    oneRm: { title: '1RM', unit: 'kg', key: 'oneRm' },
  }[metric];
  const chartData = validHistory.filter((row) => hasMetricData(row, metric));
  const latestValid = [...validHistory].reverse()[0];
  const overview = useMemo(() => buildOverview(sessions, programId), [sessions, programId]);

  useEffect(() => {
    if (exerciseId !== 'all' && !exercises.some((exercise) => exercise.id === exerciseId)) {
      setExerciseId('all');
    }
  }, [exerciseId, exercises]);

  return (
    <div className="app-page min-h-dvh">
      <header className="px-4 pb-5 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Analyse</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-50">Progressie</h1>
      </header>
      <div className="space-y-4 px-4">
        <Card>
          <ProgressFilters
            programs={programs}
            exercises={exercises}
            exerciseId={exerciseId}
            programId={programId}
            onExerciseChange={setExerciseId}
            onProgramChange={(nextProgramId) => {
              setProgramId(nextProgramId);
              setExerciseId('all');
            }}
          />
        </Card>

        {!hasSelectedExercise ? (
          <InstructionState overview={overview} />
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-black text-zinc-50">{selectedExercise.name}</h2>
            </div>
            <LatestValidCard row={latestValid} />
            {comparison && <ComparisonCard comparison={comparison} />}
            <Card className="grid grid-cols-4 gap-2">
              {[
                ['weight', 'Gewicht'],
                ['reps', 'Reps'],
                ['effort', '%'],
                ['oneRm', '1RM'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMetric(key)}
                  className={[
                    'min-h-11 min-w-0 whitespace-nowrap rounded-md px-2 text-[0.72rem] font-bold transition',
                    metric === key ? 'bg-emerald-400 text-zinc-950' : 'bg-zinc-800 text-zinc-300',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </Card>
            {chartData.length >= 2 ? (
              <ExerciseChart
                title={`${selectedExercise.name} — ${currentMetric.title} over tijd`}
                data={chartData}
                dataKey={currentMetric.key}
                unit={currentMetric.unit}
                domain={metric === 'effort' ? [0, 100] : undefined}
              />
            ) : (
              <TrendEmptyState row={chartData[0]} metric={metric} exerciseName={selectedExercise.name} />
            )}
            {history.length > 0 && (
              <HistoryList
                history={history}
                onUpdateSession={onUpdateSession}
                onDeleteSession={onDeleteSession}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InstructionState({ overview }) {
  return (
    <Card>
      <p className="font-bold text-zinc-100">Kies een oefening om progressie te bekijken.</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Selecteer een oefening om je metingen, vergelijking en trendgrafiek door de tijd te zien.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniStat label="Deze maand" value={overview.monthCount} />
        <MiniStat label="Laatste training" value={overview.latestDate} />
      </div>
    </Card>
  );
}

function LatestValidCard({ row }) {
  if (!row) {
    return (
      <Card>
        <p className="text-sm text-zinc-400">Nog geen data voor deze oefening.</p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Laatste meting</p>
      <h2 className="mt-2 text-xl font-black text-zinc-50">{formatSetPerformance(displaySet(row), row.modality)}</h2>
      <p className="mt-1 text-sm text-zinc-400">
        {formatDateTime(row)}
      </p>
      <p className="mt-2 text-sm font-semibold text-zinc-200">
        {row.totalSets} sets · {row.totalReps} reps · {formatEffort(row.effort)}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Volume {row.totalVolume}kg
      </p>
    </Card>
  );
}

function TrendEmptyState({ row, metric, exerciseName }) {
  if (!row) {
    return (
      <Card>
        <p className="font-bold text-zinc-100">Nog geen data voor deze oefening.</p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Log {exerciseName} met geldige {metricLabel(metric).toLowerCase()} om een grafiek op te bouwen.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="font-bold text-zinc-100">Nog één meting nodig voor een trend.</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Log deze oefening nog een keer met geldige {metricLabel(metric).toLowerCase()}.
      </p>
      {row && (
        <p className="mt-3 rounded-md bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
          Laatste meting: {formatSetPerformance(displaySet(row), row.modality)}
        </p>
      )}
    </Card>
  );
}

function ComparisonCard({ comparison }) {
  if (!comparison) {
    return (
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Laatste sessie vs vorige sessie</p>
        <p className="mt-2 text-sm text-zinc-400">Meer geldige sessies nodig voor vergelijking.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Laatste sessie vs vorige sessie</p>
          <p className="mt-1 text-sm text-zinc-400">
            {formatDateTime(comparison.previous)} → {formatDateTime(comparison.latest)}
          </p>
        </div>
        <TrendBadge label={comparison.reps.label} />
      </div>
      <div className="grid gap-2 text-sm">
        <div className="rounded-md bg-zinc-950 px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Best set</p>
          <p className="mt-1 text-zinc-200">
            {comparison.bestSet.from} → {comparison.bestSet.to}
          </p>
        </div>
        <MetricRow label="Reps" value={formatDiff(comparison.reps.diff, '')} trend={comparison.reps.label} />
        <EffortMetricRow effort={comparison.effort} />
        <MetricRow label="e1RM" value={formatDiff(comparison.oneRm.diff, 'kg')} trend={comparison.oneRm.label} />
      </div>
    </Card>
  );
}

function EffortMetricRow({ effort }) {
  if (!effort || effort.diff === null) {
    return <MetricRow label="Inspanning" value="Geen RIR-data" trend="" />;
  }
  return (
    <MetricRow
      label="Inspanning"
      value={`${effort.previous}% → ${effort.latest}% (${formatDiff(effort.diff, '')})`}
      trend={effort.label}
    />
  );
}

function MetricRow({ label, value, trend }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md bg-zinc-950 px-3 py-2">
      <span className="font-semibold text-zinc-300">{label}</span>
      <span className="font-black text-zinc-50">{value}</span>
      <span className="text-xs font-bold text-zinc-500">{trend}</span>
    </div>
  );
}

function TrendBadge({ label }) {
  const tone = label === 'Omhoog' ? 'green' : label === 'Omlaag' ? 'red' : 'neutral';
  const Icon = label === 'Omhoog' ? TrendingUp : label === 'Omlaag' ? TrendingDown : Minus;
  return (
    <Badge tone={tone}>
      <Icon size={14} className="mr-1" />
      {label}
    </Badge>
  );
}

function HistoryList({ history, onUpdateSession, onDeleteSession }) {
  const [editingRowId, setEditingRowId] = useState(null);

  return (
    <Card className="space-y-3">
      <details>
        <summary className="cursor-pointer list-none text-lg font-black text-zinc-50">Bekijk logs</summary>
        <div className="mt-3 space-y-3">
          {[...history].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).map((row) => (
            <HistoryRow
              key={row.id}
              row={row}
              editing={editingRowId === row.id}
              onEdit={() => setEditingRowId(row.id)}
              onCancelEdit={() => setEditingRowId(null)}
              onSave={(session) => {
                onUpdateSession(session);
                setEditingRowId(null);
              }}
              onDelete={() => {
                if (window.confirm('Weet je zeker dat je deze volledige training wilt verwijderen?')) {
                  onDeleteSession(row.sessionId);
                }
              }}
            />
          ))}
        </div>
      </details>
    </Card>
  );
}

function HistoryRow({ row, editing, onEdit, onCancelEdit, onSave, onDelete }) {
  if (editing) {
    return <SessionEditor row={row} onCancel={onCancelEdit} onSave={onSave} />;
  }

  return (
    <details className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-zinc-50">{formatDateTime(row)}</p>
            <p className="mt-1 text-xs text-zinc-500">{row.programName}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {row.incomplete && <Badge tone="amber">Onvolledige data</Badge>}
            {row.prBadges.map((badge) => (
              <Badge key={badge} tone={badge === 'Volume PR' ? 'neutral' : 'green'}>
                {badge}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2 text-sm">
          <p className="text-zinc-300">
            <span className="text-zinc-500">Best set: </span>
            {formatSetPerformance(displaySet(row), row.modality)}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Sets" value={row.totalSets} />
            <MiniStat label="Reps" value={row.totalReps} />
            <MiniStat label="Inspanning" value={formatEffort(row.effort)} />
          </div>
        </div>
      </summary>
      <div className="mt-4 space-y-3 border-t border-zinc-800 pt-3">
        <SetBreakdown exercise={row.rawExercise} modality={row.modality} />
        <div className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
          Volume: <span className="font-bold text-zinc-100">{row.totalVolume}kg</span>
        </div>
        <div className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
          Voltooid: <span className="font-bold text-zinc-100">{formatFullTimestamp(row.completedAt)}</span>
        </div>
        {row.rawExercise.notes && <TextBlock title="Oefening notitie" text={row.rawExercise.notes} />}
        {row.notes.length > 0 && (
          <details>
            <summary className="cursor-pointer text-sm font-bold text-zinc-400">Notities</summary>
            <div className="mt-2 space-y-1 text-xs leading-5 text-zinc-500">
              {row.notes.map((note, index) => (
                <p key={`${row.id}-${index}`}>{note}</p>
              ))}
            </div>
          </details>
        )}
        <RecoverySummary recovery={row.sessionRecovery} />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>Sessie bewerken</Button>
          <Button variant="danger" size="sm" onClick={onDelete}>
            <Trash2 size={16} />
            Sessie verwijderen
          </Button>
        </div>
      </div>
    </details>
  );
}

function SessionEditor({ row, onCancel, onSave }) {
  const [sessionDraft, setSessionDraft] = useState(() => structuredCloneSafe(row.rawSession));
  const exerciseIndex = sessionDraft.exercises.findIndex((exercise) => exercise.exerciseId === row.exerciseId);
  const exercise = sessionDraft.exercises[exerciseIndex];

  function updateExercise(patch) {
    setSessionDraft((current) => ({
      ...current,
      exercises: current.exercises.map((item, index) => (index === exerciseIndex ? { ...item, ...patch } : item)),
    }));
  }

  function updateSet(setNumber, patch) {
    updateExercise({
      sets: exercise.sets.map((set) => (set.setNumber === setNumber ? { ...set, ...patch } : set)),
    });
  }

  function updateRecoveryNotes(notes) {
    setSessionDraft((current) => ({
      ...current,
      recovery: { ...(current.recovery || {}), notes },
    }));
  }

  return (
    <div className="rounded-lg border border-emerald-400/30 bg-zinc-950 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-black text-zinc-50">Sessie bewerken</p>
          <p className="text-xs text-zinc-500">{formatDateTime(row)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Annuleren">
          <X size={18} />
        </Button>
      </div>
      <div className="space-y-3">
        {exercise.sets.map((set) => (
          <div key={set.setNumber} className="rounded-md bg-zinc-900 p-3">
            <p className="mb-2 text-sm font-bold text-zinc-100">Set {set.setNumber}</p>
            <div className="grid grid-cols-3 gap-2">
              <EditInput label="kg" value={set.weight} onChange={(weight) => updateSet(set.setNumber, { weight })} decimal />
              <EditInput label="reps" value={set.reps} onChange={(reps) => updateSet(set.setNumber, { reps })} />
              <EditInput label="RIR" value={set.rir ?? ''} onChange={(rir) => updateSet(set.setNumber, { rir })} />
            </div>
            <label className="mt-2 flex min-h-10 items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={set.effortLabel === 'max'}
                onChange={(event) => updateSet(set.setNumber, { effortLabel: event.target.checked ? 'max' : null, rir: event.target.checked ? 0 : set.rir })}
                className="h-4 w-4 accent-emerald-400"
              />
              MAX/failure
            </label>
            <label className="mt-2 block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Set notitie</span>
              <textarea
                value={set.notes || ''}
                onChange={(event) => updateSet(set.setNumber, { notes: event.target.value })}
                className="min-h-16 w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                placeholder="Optioneel"
              />
            </label>
          </div>
        ))}
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Oefening notitie</span>
          <textarea
            value={exercise.notes || ''}
            onChange={(event) => updateExercise({ notes: event.target.value })}
            className="min-h-20 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Recovery notitie</span>
          <textarea
            value={sessionDraft.recovery?.notes || ''}
            onChange={(event) => updateRecoveryNotes(event.target.value)}
            className="min-h-20 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onCancel}>Annuleren</Button>
          <Button onClick={() => onSave(sessionDraft)}>
            <Save size={16} />
            Wijzigingen opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}

function SetBreakdown({ exercise, modality }) {
  return (
    <div className="space-y-2">
      {exercise.sets.map((set) => (
        <div key={set.setNumber} className="rounded-md bg-zinc-900 px-3 py-2 text-sm">
          <p className="font-semibold text-zinc-200">
            Set {set.setNumber}: {formatSetPerformance(set, modality)}
          </p>
          {set.notes && <p className="mt-1 text-xs text-zinc-500">{set.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function RecoverySummary({ recovery }) {
  if (!recovery) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {['sleepQuality', 'energyLevel', 'recoveryLevel', 'stressLevel', 'painLevel'].map((key) => (
        recovery[key] ? (
          <span key={key} className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-400">
            {recovery[key]}
          </span>
        ) : null
      ))}
      {recovery.notes && <span className="w-full text-xs leading-5 text-zinc-500">{recovery.notes}</span>}
    </div>
  );
}

function TextBlock({ title, text }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">{title}</p>
      <p className="mt-1 text-sm leading-5 text-zinc-300">{text}</p>
    </div>
  );
}

function EditInput({ label, value, onChange, decimal = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-zinc-500">{label}</span>
      <input
        value={value ?? ''}
        inputMode={decimal ? 'decimal' : 'numeric'}
        onChange={(event) => onChange(parseEditNumber(event.target.value, decimal))}
        className="min-h-11 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 text-center text-sm font-bold text-zinc-100 outline-none focus:border-emerald-400"
      />
    </label>
  );
}

function hasExerciseMeasurement(row) {
  return Boolean(
    row &&
      row.totalSets > 0 &&
      (
        row.totalReps > 0 ||
        row.durationMinutes > 0 ||
        row.distanceMeters > 0 ||
        row.bestSet ||
        row.heaviestSet ||
        (row.effort !== null && row.effort !== undefined)
      ),
  );
}

function hasMetricData(row, metric) {
  if (!row) return false;
  if (metric === 'weight') return row.modality === 'strength' && Number(row.weight || 0) > 0;
  if (metric === 'reps') return Number(row.reps || row.totalReps || 0) > 0;
  if (metric === 'effort') return row.effort !== null && row.effort !== undefined;
  if (metric === 'oneRm') return Number(row.oneRm || 0) > 0;
  return false;
}

function hasComparisonData(row) {
  return Boolean(
    row &&
      (
        row.bestSet ||
        row.heaviestSet ||
        row.totalReps > 0 ||
        row.bestOneRm > 0 ||
        (row.effort !== null && row.effort !== undefined)
      ),
  );
}

function displaySet(row) {
  return row?.bestSet || row?.heaviestSet || row?.rawExercise?.sets?.find((set) => set.completed) || null;
}

function metricLabel(metric) {
  return {
    weight: 'Gewicht',
    reps: 'Reps',
    effort: 'Inspanning',
    oneRm: '1RM',
  }[metric] || 'data';
}

function buildOverview(sessions, programId) {
  const done = completedSessions(sessions)
    .filter((session) => programId === 'all' || session.programId === programId);
  const now = new Date();
  const monthCount = done.filter((session) => {
    if (!session.date) return false;
    return isSameMonth(parseISO(session.date), now);
  }).length;
  const latest = [...done].sort(byCompletedDesc)[0];

  return {
    monthCount,
    latestDate: latest ? formatShortDate(latest.date) : '-',
  };
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-md bg-zinc-900 px-2 py-2">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 font-black text-zinc-100">{value}</p>
    </div>
  );
}

function formatDiff(diff, unit) {
  if (!diff) return `0${unit ? ` ${unit}` : ''}`;
  return `${diff > 0 ? '+' : ''}${diff}${unit ? ` ${unit}` : ''}`;
}

function formatEffort(value) {
  return value === null || value === undefined ? 'Geen RIR-data' : `${value}%`;
}

function formatDateTime(row) {
  const value = row.completedAt || row.date;
  const date = value.includes('T') ? parseISO(value) : parseISO(`${value}T00:00:00`);
  const hasTime = value.includes('T');
  return hasTime
    ? format(date, 'd MMM · HH:mm', { locale: nl })
    : formatShortDate(row.date);
}

function formatFullTimestamp(value) {
  if (!value) return 'Onbekend';
  const date = String(value).includes('T') ? parseISO(value) : parseISO(`${value}T00:00:00`);
  return format(date, 'd MMM yyyy · HH:mm', { locale: nl });
}

function parseEditNumber(value, decimal) {
  const normalized = String(value).replace(',', '.').trim();
  if (!normalized) return '';
  const number = Number(normalized);
  if (!Number.isFinite(number)) return '';
  const safe = Math.max(0, number);
  return decimal ? Math.round(safe * 100) / 100 : Math.floor(safe);
}

function structuredCloneSafe(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}
