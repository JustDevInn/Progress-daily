import { Check } from 'lucide-react';
import { useState } from 'react';

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

function EditableCell({ value, suffix, onCommit, inputMode = 'decimal', integer = false, ariaLabel }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(formatNumber(value));
  const display = formatNumber(value);

  function commit() {
    const parsed = parseNumber(draft, integer || inputMode === 'numeric');
    onCommit(parsed);
    setDraft(formatNumber(parsed));
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        aria-label={ariaLabel}
        value={draft}
        inputMode={inputMode}
        enterKeyHint="done"
        autoComplete="off"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === 'Escape') {
            setDraft(formatNumber(value));
            setEditing(false);
          }
        }}
        className="h-10 min-w-0 rounded-md border border-emerald-400 bg-zinc-950 px-2 text-center text-sm font-black tabular-nums text-zinc-50 outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="min-h-10 min-w-0 overflow-hidden rounded-md px-1 text-center text-sm font-bold tabular-nums text-zinc-100 hover:bg-zinc-800"
      onClick={() => {
        setDraft(formatNumber(value));
        setEditing(true);
      }}
    >
      <span className="block truncate whitespace-nowrap">
        {display === '' ? '-' : display} {suffix}
      </span>
    </button>
  );
}

function RirCell({ rir, effortLabel, onChange }) {
  const [open, setOpen] = useState(false);
  const activeRir = rir === '' || rir === null || rir === undefined ? 2 : Number(rir);
  const label = effortLabel === 'max' ? 'MAX' : `RIR ${Number.isFinite(activeRir) ? activeRir : 2}`;

  function select(value) {
    if (value === 'max') onChange({ rir: 0, effortLabel: 'max' });
    else onChange({ rir: value, effortLabel: null });
    setOpen(false);
  }

  return (
    <div
      className="relative min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className={[
          'min-h-10 w-full rounded-md px-1 text-center text-sm font-bold tabular-nums hover:bg-zinc-800',
          effortLabel === 'max' ? 'text-amber-200' : 'text-zinc-100',
        ].join(' ')}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 grid w-44 grid-cols-3 gap-1 rounded-md border border-zinc-700 bg-zinc-950 p-1 shadow-xl shadow-black/40">
          {[0, 1, 2, 3, 4, 'max'].map((value) => (
            <button
              key={value}
              type="button"
              className={[
                'min-h-10 rounded-md text-sm font-black transition',
                (value === 'max' && effortLabel === 'max') || (value === activeRir && effortLabel !== 'max')
                  ? 'bg-emerald-400 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800',
              ].join(' ')}
              onClick={() => select(value)}
            >
              {value === 'max' ? 'MAX' : value}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SetLogger({ set, modality = 'strength', onChange, onComplete }) {
  const isTimed = modality === 'timed';
  const isCarry = modality === 'carry';
  const isBodyweight = modality === 'bodyweight';
  const missingStrengthWeight =
    modality === 'strength' && set.completed && Number(set.reps || 0) > 0 && Number(set.weight || 0) <= 0;
  const rowClass = [
    'grid items-center gap-1 rounded-md border px-2 py-1 transition',
    isTimed
      ? 'grid-cols-[minmax(0,1fr)_2.5rem]'
      : isCarry
        ? 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem]'
        : isBodyweight
          ? 'grid-cols-[minmax(0,1fr)_minmax(4rem,0.75fr)_2.5rem]'
          : 'grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(4rem,0.75fr)_2.5rem]',
    set.completed ? 'border-emerald-400/35 bg-emerald-400/10' : 'border-zinc-800 bg-zinc-950/70',
    missingStrengthWeight ? 'ring-1 ring-amber-300/40' : '',
  ].join(' ');

  return (
    <div className={rowClass}>
      {isTimed && (
        <EditableCell
          value={Number(set.durationMinutes || 0)}
          suffix="min"
          onCommit={(durationMinutes) => onChange({ durationMinutes })}
          ariaLabel="Duur aanpassen"
        />
      )}
      {isCarry && (
        <>
          <EditableCell
            value={Number(set.distanceMeters || 0)}
            suffix="m"
            onCommit={(distanceMeters) => onChange({ distanceMeters })}
            inputMode="numeric"
            integer
            ariaLabel="Afstand aanpassen"
          />
          <EditableCell
            value={set.weight === '' || set.weight === null || set.weight === undefined ? '' : Number(set.weight || 0)}
            suffix="kg"
            onCommit={(weight) => onChange({ weight })}
            ariaLabel="Gewicht aanpassen"
          />
        </>
      )}
      {!isTimed && !isCarry && !isBodyweight && (
        <EditableCell
          value={set.weight === '' || set.weight === null || set.weight === undefined ? '' : Number(set.weight || 0)}
          suffix="kg"
          onCommit={(weight) => onChange({ weight })}
          ariaLabel="Gewicht aanpassen"
        />
      )}
      {!isTimed && !isCarry && (
        <EditableCell
          value={Number(set.reps || 0)}
          suffix="reps"
          onCommit={(reps) => onChange({ reps })}
          inputMode="numeric"
          integer
          ariaLabel="Reps aanpassen"
        />
      )}
      {!isTimed && !isCarry && <RirCell rir={set.rir} effortLabel={set.effortLabel} onChange={onChange} />}
      <button
        type="button"
        onClick={onComplete}
        className={[
          'flex h-10 w-10 items-center justify-center rounded-md transition',
          set.completed
            ? 'bg-emerald-400 text-zinc-950'
            : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200',
        ].join(' ')}
        aria-label={set.completed ? 'Set als open markeren' : 'Set als voltooid markeren'}
      >
        {set.completed ? <Check size={18} strokeWidth={3} /> : <span className="h-4 w-4 rounded-full border-2 border-current" />}
      </button>
    </div>
  );
}
