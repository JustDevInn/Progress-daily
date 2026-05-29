import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';

const fields = [
  {
    key: 'sleepQuality',
    label: 'Slaap',
    options: [
      ['slecht', 'slecht'],
      ['oke', 'oké'],
      ['goed', 'goed'],
    ],
  },
  {
    key: 'energyLevel',
    label: 'Energie',
    options: [
      ['moe', 'moe'],
      ['normaal', 'normaal'],
      ['fit', 'fit'],
    ],
  },
  {
    key: 'recoveryLevel',
    label: 'Herstel',
    options: [
      ['slecht', 'slecht'],
      ['redelijk', 'redelijk'],
      ['goed', 'goed'],
    ],
  },
  {
    key: 'stressLevel',
    label: 'Stress',
    options: [
      ['laag', 'laag'],
      ['normaal', 'normaal'],
      ['hoog', 'hoog'],
    ],
  },
  {
    key: 'painLevel',
    label: 'Pijn',
    options: [
      ['geen', 'geen'],
      ['licht', 'licht'],
      ['matig', 'matig'],
      ['hoog', 'hoog'],
    ],
  },
];

const initialRecovery = {
  sleepQuality: 'goed',
  energyLevel: 'normaal',
  recoveryLevel: 'goed',
  stressLevel: 'laag',
  painLevel: 'geen',
  painLocation: '',
  notes: '',
};

function normalizeRecovery(value = {}) {
  return {
    ...initialRecovery,
    ...(value || {}),
    painLocation: value?.painLocation ?? '',
    notes: value?.notes ?? '',
  };
}

export function CompletionModal({ initialValue, onChange, onClose, onComplete }) {
  const [form, setForm] = useState(() => normalizeRecovery(initialValue));

  function update(patch) {
    setForm((current) => {
      const next = normalizeRecovery({ ...current, ...patch });
      onChange?.(next);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 md:absolute">
      <div className="safe-bottom-sheet max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border-t border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-50">Training afronden</h2>
            <p className="mt-1 text-sm text-zinc-400">Herstelcheck</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Sluiten">
            <X size={22} />
          </Button>
        </div>
        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <div className="mb-2 text-sm font-bold text-zinc-200">{field.label}</div>
              <div className={`grid gap-2 ${field.options.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {field.options.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update({ [field.key]: value })}
                    className={[
                      'min-h-12 rounded-md text-sm font-bold transition active:scale-[0.99]',
                      form[field.key] === value ? 'bg-emerald-400 text-zinc-950' : 'bg-zinc-900 text-zinc-300',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-200">Pijnlocatie</span>
            <input
              value={form.painLocation || ''}
              onChange={(event) => update({ painLocation: event.target.value })}
              className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-100 outline-none focus:border-emerald-400"
              placeholder="Bijv. knie links"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-200">Notities</span>
            <textarea
              value={form.notes || ''}
              onChange={(event) => update({ notes: event.target.value })}
              className="min-h-28 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 outline-none focus:border-emerald-400"
              placeholder="Korte notitie"
            />
          </label>
          <Button size="lg" className="w-full" onClick={() => onComplete(normalizeRecovery(form))}>
            Opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}
