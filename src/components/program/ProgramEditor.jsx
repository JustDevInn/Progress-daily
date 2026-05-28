import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ExerciseEditor } from './ExerciseEditor';

function targetSummary(exercise) {
  if (exercise.modality === 'timed') return `${exercise.targetDurationMinutes || 0} min · ${exercise.restSeconds}s rust`;
  if (exercise.modality === 'carry') return `${exercise.targetSets} x ${exercise.targetDistanceMeters || 0}m · ${exercise.restSeconds}s rust`;
  if (exercise.modality === 'bodyweight') return `${exercise.targetSets} x ${exercise.targetRepMin}-${exercise.targetRepMax} reps · RIR ${exercise.targetRirMin}-${exercise.targetRirMax}`;
  return `${exercise.targetSets} x ${exercise.targetRepMin}-${exercise.targetRepMax} · RIR ${exercise.targetRirMin}-${exercise.targetRirMax} · ${exercise.restSeconds}s`;
}

export function ProgramEditor({ programs, onProgramsChange }) {
  const [openPrograms, setOpenPrograms] = useState(() =>
    Object.fromEntries(programs.map((program) => [program.id, true])),
  );
  const [editing, setEditing] = useState(null);

  function toggleProgram(programId) {
    setOpenPrograms((current) => ({ ...current, [programId]: !current[programId] }));
  }

  function updateProgram(nextProgram) {
    onProgramsChange(programs.map((program) => (program.id === nextProgram.id ? nextProgram : program)));
  }

  function saveExercise(program, exercise) {
    const exists = program.exercises.some((item) => item.id === exercise.id);
    updateProgram({
      ...program,
      exercises: exists
        ? program.exercises.map((item) => (item.id === exercise.id ? exercise : item))
        : [...program.exercises, exercise],
    });
    setEditing(null);
  }

  function removeExercise(program, exerciseId) {
    updateProgram({
      ...program,
      exercises: program.exercises.filter((exercise) => exercise.id !== exerciseId),
    });
  }

  return (
    <div className="space-y-3">
      {programs.map((program) => {
        const isOpen = openPrograms[program.id];
        const activeEditor = editing?.programId === program.id ? editing.exercise : null;

        return (
          <Card key={program.id} className="space-y-4">
            <button
              type="button"
              onClick={() => toggleProgram(program.id)}
              className="flex min-h-12 w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <h2 className="text-xl font-black text-zinc-50">{program.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{program.description}</p>
              </div>
              <ChevronDown
                size={22}
                className={['shrink-0 text-zinc-400 transition', isOpen ? 'rotate-180' : ''].join(' ')}
              />
            </button>

            {isOpen && (
              <div className="space-y-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditing({ programId: program.id, exercise: {} })}
                  className="w-full"
                >
                  <Plus size={18} />
                  Oefening toevoegen
                </Button>

                {activeEditor && (
                  <ExerciseEditor
                    exercise={activeEditor.id ? activeEditor : null}
                    onSave={(exercise) => saveExercise(program, exercise)}
                    onCancel={() => setEditing(null)}
                  />
                )}

                <div className="space-y-3">
                  {program.exercises.map((exercise) => (
                    <div key={exercise.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-zinc-50">{exercise.name}</h3>
                            <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">
                              {exercise.modality || 'strength'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-zinc-400">{targetSummary(exercise)}</p>
                          <p className="mt-2 text-xs text-zinc-500">{exercise.muscleGroups.join(', ')}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setEditing({ programId: program.id, exercise })}
                            aria-label="Bewerk"
                          >
                            <Pencil size={18} />
                          </Button>
                          <Button
                            variant="danger"
                            size="icon"
                            onClick={() => removeExercise(program, exercise.id)}
                            aria-label="Verwijder"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
