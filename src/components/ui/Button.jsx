export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300 active:bg-emerald-500',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-900',
    ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800',
    danger: 'bg-red-500/15 text-red-200 hover:bg-red-500/25',
    complete: 'bg-zinc-100 text-zinc-950 hover:bg-white',
  };
  const sizes = {
    sm: 'min-h-10 px-3 text-sm',
    md: 'min-h-12 px-4 text-sm',
    lg: 'min-h-14 px-5 text-base',
    icon: 'h-11 w-11 p-0',
  };

  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
