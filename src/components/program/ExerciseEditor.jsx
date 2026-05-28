import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';

const emptyExercise = {
  id: '',
  name: '',
  modality: 'strength',
  muscleGroups: [],
  targetSets: 3,
  targetRepMin: 8,
  targetRepMax: 12,
  targetRirMin: 1,
  targetRirMax: 3,
  targetDurationMinutes: 0,
  targetDistanceMeters: 0,
  restSeconds: 120,
  notes: '',
};

function slug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function ExerciseEditor({ exercise, onSave, onCancel }) {
  const [form, setForm] = useState(emptyExercise);

  useEffect(() => {
    setForm(exercise || emptyExercise);
  }, [exercise]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    if (!form.name.trim()) return;
    onSave({
      ...form,
      id: form.id || slug(form.name),
      name: form.name.trim(),
      modality: form.modality || 'strength',
      muscleGroups: String(form.muscleGroups)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      targetSets: Number(form.targetSets),
      targetRepMin: Number(form.targetRepMin),
      targetRepMax: Number(form.targetRepMax),
      targetRirMin: Number(form.targetRirMin),
      targetRirMax: Number(form.targetRirMax),
      targetDurationMinutes: Number(form.targetDurationMinutes || 0),
      targetDistanceMeters: Number(form.targetDistanceMeters || 0),
      restSeconds: Number(form.restSeconds),
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
      <div className="grid gap-3">
        <TextInput label="Naam" value={form.name} onChange={(value) => update('name', value)} />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Type</span>
          <select
            value={form.modality || 'strength'}
            onChange={(event) => update('modality', event.target.value)}
            className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
          >
            <option value="strength">strength</option>
            <option value="bodyweight">bodyweight</option>
            <option value="timed">timed</option>
            <option value="carry">carry</option>
          </select>
        </label>
        <TextInput
          label="Spiergroepen"
          value={Array.isArray(form.muscleGroups) ? form.muscleGroups.join(', ') : form.muscleGroups}
          onChange={(value) => update('muscleGroups', value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="Sets" value={form.targetSets} onChange={(value) => update('targetSets', value)} />
          <NumberInput label="Rust sec" value={form.restSeconds} onChange={(value) => update('restSeconds', value)} />
          {['strength', 'bodyweight'].includes(form.modality || 'strength') && (
            <>
              <NumberInput label="Rep min" value={form.targetRepMin} onChange={(value) => update('targetRepMin', value)} />
              <NumberInput label="Rep max" value={form.targetRepMax} onChange={(value) => update('targetRepMax', value)} />
              <NumberInput label="RIR min" value={form.targetRirMin} onChange={(value) => update('targetRirMin', value)} />
              <NumberInput label="RIR max" value={form.targetRirMax} onChange={(value) => update('targetRirMax', value)} />
            </>
          )}
          {(form.modality || 'strength') === 'timed' && (
            <NumberInput
              label="Minuten"
              value={form.targetDurationMinutes || 0}
              onChange={(value) => update('targetDurationMinutes', value)}
            />
          )}
          {(form.modality || 'strength') === 'carry' && (
            <NumberInput
              label="Meters"
              value={form.targetDistanceMeters || 0}
              onChange={(value) => update('targetDistanceMeters', value)}
            />
          )}
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Notities</span>
          <textarea
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            className="min-h-24 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Annuleren
        </Button>
        <Button onClick={save}>Opslaan</Button>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
      />
    </label>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
      />
    </label>
  );
}
