import { BottomNav } from './BottomNav';

export function AppLayout({ activeTab, onTabChange, children, hideNav = false }) {
  return (
    <div className="min-h-screen md:flex md:items-start md:justify-center md:py-6">
      <main className="relative min-h-screen w-full bg-zinc-950 md:min-h-[900px] md:max-w-md md:overflow-hidden md:rounded-[1.5rem] md:border md:border-zinc-800 md:shadow-2xl">
        {children}
        {!hideNav && <BottomNav activeTab={activeTab} onTabChange={onTabChange} />}
      </main>
    </div>
  );
}
