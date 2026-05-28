import { useRef, useState } from 'react';
import { ProgramEditor } from '../components/program/ProgramEditor';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { currentProgramExerciseIds } from '../data/seedPrograms';

export function ProgramPage({
  programs,
  onProgramsChange,
  onResetProgramsToCurrentSchema,
  settings,
  onSettingsChange,
  exportLocalData,
  importLocalData,
  resetActiveWorkout,
  resetSessionsOnly,
  resetAllLocalData,
  incompleteTestSessionCount = 0,
  deleteIncompleteTestSessions,
}) {
  const fileInputRef = useRef(null);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  function downloadBackup() {
    const data = exportLocalData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dailyprogress-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(raw) {
    setImportError('');
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.programs) || !Array.isArray(parsed.sessions)) {
        throw new Error('Backup mist programs of sessions.');
      }
      if (window.confirm('Lokale data vervangen door deze backup?')) {
        importLocalData(parsed);
        setImportText('');
      }
    } catch (error) {
      setImportError(error.message || 'Ongeldig JSON bestand.');
    }
  }

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleImport(String(reader.result || ''));
    reader.onerror = () => setImportError('Bestand kon niet worden gelezen.');
    reader.readAsText(file);
    event.target.value = '';
  }

  function confirmAction(message, action) {
    if (window.confirm(message)) action();
  }

  const hasOldExercises = programs.some((program) =>
    program.exercises.some((exercise) => !currentProgramExerciseIds.includes(exercise.id)),
  );

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pb-5 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Beheer</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-50">Schema</h1>
      </header>
      <div className="space-y-4 px-4">
        {hasOldExercises && (
          <Card className="border-amber-400/30 bg-amber-400/10">
            <p className="text-sm font-bold text-amber-100">
              Je schema bevat oude oefeningen. Reset schema naar huidig A/B/C schema.
            </p>
          </Card>
        )}
        <ProgramEditor programs={programs} onProgramsChange={onProgramsChange} />

        <Card className="space-y-3">
          <div>
            <h2 className="text-sm font-black text-zinc-100">Training instellingen</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">Lokale instellingen voor gebruik tijdens training.</p>
          </div>
          <label className="flex min-h-12 items-center justify-between gap-3 rounded-md bg-zinc-950 px-3">
            <span className="text-sm font-bold text-zinc-200">Trillen bij rust klaar</span>
            <input
              type="checkbox"
              checked={Boolean(settings?.vibrationEnabled)}
              onChange={(event) =>
                onSettingsChange({ vibrationEnabled: event.target.checked })
              }
              className="h-5 w-5 accent-emerald-400"
            />
          </label>
        </Card>

        <Card className="space-y-3">
          <div>
            <h2 className="text-sm font-black text-zinc-100">Backup</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">Exporteer of importeer lokale schema's, sessies en actieve training.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" onClick={downloadBackup}>
              Export lokale data
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Import bestand
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            className="min-h-24 w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
            placeholder="Plak backup JSON"
          />
          <Button variant="secondary" size="sm" onClick={() => handleImport(importText)} disabled={!importText.trim()}>
            Import geplakte JSON
          </Button>
          {importError && <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-200">{importError}</p>}
        </Card>

        <Card className="space-y-3 border-zinc-800 bg-zinc-950">
          <div>
            <h2 className="text-sm font-black text-zinc-100">Debug</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">Destructieve lokale acties. Seed/mock data blijft in de app aanwezig.</p>
          </div>
          <div className="grid gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                confirmAction(
                  'Schema vervangen door het huidige A/B/C schema? Bestaande sessies blijven bewaard.',
                  onResetProgramsToCurrentSchema,
                )
              }
            >
              Reset schema naar huidig A/B/C schema
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => confirmAction('Actieve training resetten?', resetActiveWorkout)}
            >
              Reset actieve training
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => confirmAction('Alleen lokaal opgeslagen sessies resetten?', resetSessionsOnly)}
            >
              Reset alleen sessies
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => confirmAction('Alles terugzetten naar seed data?', resetAllLocalData)}
            >
              Reset alles naar seed data
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!incompleteTestSessionCount}
              onClick={() =>
                confirmAction(
                  `Er zijn ${incompleteTestSessionCount} onvolledige sessies gevonden. Deze volledige trainingen verwijderen?`,
                  deleteIncompleteTestSessions,
                )
              }
            >
              Verwijder onvolledige test-sessies
            </Button>
            <p className="rounded-md bg-zinc-900 px-3 py-2 text-xs leading-5 text-zinc-400">
              Er zijn {incompleteTestSessionCount} onvolledige sessies gevonden.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
