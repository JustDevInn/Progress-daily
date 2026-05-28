export function Card({ children, className = '' }) {
  return (
    <section className={['rounded-lg border border-zinc-800 bg-zinc-900/82 p-4 shadow-sm', className].join(' ')}>
      {children}
    </section>
  );
}
