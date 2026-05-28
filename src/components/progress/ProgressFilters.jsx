export function ProgressFilters({ programs, exercises, exerciseId, programId, onExerciseChange, onProgramChange }) {
  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Training</span>
        <select
          value={programId}
          onChange={(event) => onProgramChange(event.target.value)}
          className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-100 outline-none focus:border-emerald-400"
        >
          <option value="all">Alle trainingen</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Oefening</span>
        <select
          value={exerciseId}
          onChange={(event) => onExerciseChange(event.target.value)}
          className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-100 outline-none focus:border-emerald-400"
        >
          <option value="all">Alle oefeningen</option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
