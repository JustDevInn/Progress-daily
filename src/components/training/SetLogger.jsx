import { Check, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';

function formatNumber(value) {
  if (value === '' || value === null || value === undefined) return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return Number.isInteger(number) ? String(number) : String(Math.round(number * 100) / 100);
}

function parseNumber(value, integer = false) {
  const normalized = String(value).replace(',', '.').trim();
  if (!normalized) return '';
  const number = Number(normalized);
  if (!Number.isFinite(number)) return '';
  const safe = Math.max(0, number);
  return integer ? Math.floor(safe) : Math.round(safe * 100) / 100;
}

function NumberStep({ value, suffix, onMinus, onPlus, onCommit, inputMode = 'decimal' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(formatNumber(value));

  function commit() {
    const parsed = parseNumber(draft, inputMode === 'numeric');
    onCommit(parsed);
    setDraft(formatNumber(parsed));
    setEditing(false);
  }

  return (
    <div className="grid grid-cols-[2.75rem_1fr_2.75rem] overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
      <button type="button" className="flex min-h-11 items-center justify-center text-zinc-300" onClick={onMinus}>
        <Minus size={18} />
      </button>
      {editing ? (
        <input
          autoFocus
          value={draft}
          inputMode={inputMode}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') {
              setDraft(formatNumber(value));
              setEditing(false);
            }
          }}
          className="min-h-11 w-full bg-zinc-950 px-2 text-center text-base font-black tabular-nums text-zinc-50 outline-none"
        />
      ) : (
        <button
          type="button"
          className="flex min-h-11 items-center justify-center text-sm font-bold tabular-nums text-zinc-50"
          onClick={() => {
            setDraft(formatNumber(value));
            setEditing(true);
          }}
        >
          {value === '' || value === null || value === undefined ? '—' : formatNumber(value)} {suffix}
        </button>
      )}
      <button type="button" className="flex min-h-11 items-center justify-center text-zinc-300" onClick={onPlus}>
        <Plus size={18} />
      </button>
    </div>
  );
}

function RirButtons({ rir, effortLabel, onChange }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">RIR</div>
      <div className="grid grid-cols-6 gap-2">
        {[0, 1, 2, 3, 4].map((value) => (
          <button
            key={value}
            type="button"
            className={[
              'min-h-11 rounded-md text-sm font-bold transition',
              rir === value && !(value === 0 && effortLabel === 'max')
                ? 'bg-emerald-400 text-zinc-950'
                : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800',
            ].join(' ')}
            onClick={() => onChange({ rir: value, effortLabel: value === 0 ? effortLabel : null })}
          >
            {value}
          </button>
        ))}
        <button
          type="button"
          className={[
            'min-h-11 rounded-md text-xs font-black transition',
            effortLabel === 'max' ? 'bg-amber-300 text-zinc-950' : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800',
          ].join(' ')}
          onClick={() => onChange({ rir: 0, effortLabel: 'max' })}
        >
          MAX
        </button>
      </div>
    </div>
  );
}

export function SetLogger({ set, modality = 'strength', onChange, onComplete }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const isTimed = modality === 'timed';
  const isCarry = modality === 'carry';
  const isBodyweight = modality === 'bodyweight';
  const missingStrengthWeight =
    modality === 'strength' && set.completed && Number(set.reps || 0) > 0 && Number(set.weight || 0) <= 0;

  return (
    <div className={['rounded-lg border p-3 transition', set.completed ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-zinc-800 bg-zinc-900'].join(' ')}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-zinc-100">Set {set.setNumber}</span>
        <Button
          variant={set.completed ? 'primary' : 'secondary'}
          size="sm"
          onClick={onComplete}
          className="min-w-24"
        >
          <Check size={16} />
          {set.completed ? 'Klaar' : 'Log'}
        </Button>
      </div>
      <div className="grid gap-3">
        {isTimed && (
          <NumberStep
            value={Number(set.durationMinutes || 0)}
            suffix="min"
            onMinus={() => onChange({ durationMinutes: Math.max(0, Number(set.durationMinutes || 0) - 5) })}
            onPlus={() => onChange({ durationMinutes: Number(set.durationMinutes || 0) + 5 })}
            onCommit={(durationMinutes) => onChange({ durationMinutes })}
          />
        )}
        {isCarry && (
          <>
            <NumberStep
              value={Number(set.distanceMeters || 0)}
              suffix="m"
              onMinus={() => onChange({ distanceMeters: Math.max(0, Number(set.distanceMeters || 0) - 5) })}
              onPlus={() => onChange({ distanceMeters: Number(set.distanceMeters || 0) + 5 })}
              onCommit={(distanceMeters) => onChange({ distanceMeters })}
              inputMode="numeric"
            />
            <NumberStep
              value={Number(set.weight || 0)}
              suffix="kg"
              onMinus={() => onChange({ weight: Math.max(0, Number(set.weight || 0) - 2.5) })}
              onPlus={() => onChange({ weight: Number(set.weight || 0) + 2.5 })}
              onCommit={(weight) => onChange({ weight })}
            />
            <NumberStep
              value={Number(set.durationMinutes || 0)}
              suffix="min"
              onMinus={() => onChange({ durationMinutes: Math.max(0, Number(set.durationMinutes || 0) - 0.5) })}
              onPlus={() => onChange({ durationMinutes: Number(set.durationMinutes || 0) + 0.5 })}
              onCommit={(durationMinutes) => onChange({ durationMinutes })}
            />
          </>
        )}
        {!isTimed && !isCarry && (
          <NumberStep
            value={set.weight === '' || set.weight === null || set.weight === undefined ? '' : Number(set.weight || 0)}
            suffix={isBodyweight ? 'extra kg' : 'kg'}
            onMinus={() => onChange({ weight: Math.max(0, Number(set.weight || 0) - 2.5) })}
            onPlus={() => onChange({ weight: Number(set.weight || 0) + 2.5 })}
            onCommit={(weight) => onChange({ weight })}
          />
        )}
        {!isTimed && !isCarry && (
          <NumberStep
            value={Number(set.reps || 0)}
            suffix="reps"
            onMinus={() => onChange({ reps: Math.max(0, Number(set.reps || 0) - 1) })}
            onPlus={() => onChange({ reps: Number(set.reps || 0) + 1 })}
            onCommit={(reps) => onChange({ reps })}
            inputMode="numeric"
          />
        )}
        {!isTimed && <RirButtons rir={set.rir} effortLabel={set.effortLabel} onChange={onChange} />}
        <div>
          <button
            type="button"
            onClick={() => setNotesOpen((open) => !open)}
            className="min-h-10 rounded-md px-3 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            {notesOpen ? 'Notitie sluiten' : '+ notitie'}
          </button>
          {notesOpen && (
            <textarea
              value={set.notes || ''}
              onChange={(event) => onChange({ notes: event.target.value })}
              className="mt-2 min-h-20 w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
              placeholder={
                isTimed
                  ? 'Notitie: snelheid, helling, gevoel'
                  : isCarry
                    ? 'Notitie: grip, gewicht, tempo'
                    : 'Notitie bij deze set'
              }
            />
          )}
        </div>
        {set.effortLabel === 'max' && (
          <p className="rounded-md bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200">MAX/failure</p>
        )}
        {missingStrengthWeight && (
          <p className="rounded-md bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200">
            Gewicht ontbreekt
          </p>
        )}
      </div>
    </div>
  );
}
