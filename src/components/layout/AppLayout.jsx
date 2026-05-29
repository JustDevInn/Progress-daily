import { BottomNav } from './BottomNav';

export function AppLayout({ activeTab, onTabChange, children, hideNav = false }) {
  return (
    <div className="app-shell min-h-dvh bg-zinc-950 md:flex md:items-start md:justify-center md:bg-transparent md:py-6">
      <main className="relative min-h-dvh w-full overflow-x-hidden bg-zinc-950 pt-[env(safe-area-inset-top)] md:min-h-[900px] md:max-w-md md:overflow-hidden md:rounded-[1.5rem] md:border md:border-zinc-800 md:pt-0 md:shadow-2xl">
        {children}
        {!hideNav && <BottomNav activeTab={activeTab} onTabChange={onTabChange} />}
      </main>
    </div>
  );
}
