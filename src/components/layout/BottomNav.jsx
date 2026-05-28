import { BarChart3, Dumbbell, LineChart, Settings2 } from 'lucide-react';

const tabs = [
  { id: 'training', label: 'Training', icon: Dumbbell },
  { id: 'progress', label: 'Progressie', icon: LineChart },
  { id: 'insights', label: 'Inzicht', icon: BarChart3 },
  { id: 'program', label: 'Schema', icon: Settings2 },
];

export function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur md:absolute">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={[
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold transition',
                active ? 'bg-emerald-400 text-zinc-950' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={2.4} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
