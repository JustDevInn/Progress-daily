import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ActiveWorkoutPage } from './components/training/ActiveWorkoutPage';
import { mockSessions } from './data/mockSessions';
import { seedPrograms } from './data/seedPrograms';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './pages/AuthPage';
import { InsightsPage } from './pages/InsightsPage';
import { ProgramPage } from './pages/ProgramPage';
import { ProgressPage } from './pages/ProgressPage';
import { TrainingPage } from './pages/TrainingPage';
import { createDataService } from './services/dataService';
import { localDataService, normalizeSettings } from './services/localDataService';
import { isIncompleteTestSession } from './utils/calculations';

const defaultSettings = { vibrationEnabled: false, localOnlyMode: true };

export default function App() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('training');
  const [activeProgram, setActiveProgram] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);
  const [programs, setPrograms] = useState(seedPrograms);
  const [storedSessions, setStoredSessions] = useState([]);
  const [activeWorkoutDraft, setActiveWorkoutDraft] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [dataLoading, setDataLoading] = useState(true);
  const [saveState, setSaveState] = useState('idle');
  const [dataError, setDataError] = useState('');
  const [dataMode, setDataMode] = useState('local');
  const [migrationPrompt, setMigrationPrompt] = useState(null);

  const serviceInfo = useMemo(
    () => createDataService({ user: auth.user, localOnlyMode: auth.localOnlyMode }),
    [auth.user, auth.localOnlyMode],
  );

  const allSessions = dataMode === 'local' ? [...mockSessions, ...storedSessions] : storedSessions;

  useEffect(() => {
    if (auth.authLoading) return;
    if (!auth.user && !auth.localOnlyMode) {
      setDataLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setDataLoading(true);
      setDataError('');
      try {
        const data = await serviceInfo.service.loadData();
        if (cancelled) return;
        setPrograms(data.programs?.length ? data.programs : seedPrograms);
        setStoredSessions(data.sessions || []);
        setActiveWorkoutDraft(data.activeWorkout || null);
        setSettings(normalizeSettings(data.settings || defaultSettings, serviceInfo.mode === 'local'));
        setDataMode(serviceInfo.mode);

        if (auth.user && serviceInfo.mode === 'firestore') {
          const localData = await localDataService.loadData();
          const hasLocalData =
            (localData.sessions || []).length > 0 ||
            Boolean(localData.activeWorkout) ||
            Boolean(localData.settings?.vibrationEnabled) ||
            JSON.stringify(localData.programs || []) !== JSON.stringify(seedPrograms);
          const hasCloudData = (data.sessions || []).length > 0 || Boolean(data.activeWorkout);
          if (!hasCloudData && hasLocalData) setMigrationPrompt(localData);
        }
      } catch (error) {
        if (cancelled) return;
        const localData = await localDataService.loadData();
        setPrograms(localData.programs?.length ? localData.programs : seedPrograms);
        setStoredSessions(localData.sessions || []);
        setActiveWorkoutDraft(localData.activeWorkout || null);
        setSettings(normalizeSettings(localData.settings || defaultSettings, true));
        setDataMode('local');
        setDataError('Cloud laden mislukt. Lokale data wordt gebruikt.');
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [auth.authLoading, auth.localOnlyMode, auth.user, serviceInfo]);

  useEffect(() => {
    if (!['saved', 'local'].includes(saveState)) return undefined;
    const timeout = window.setTimeout(() => setSaveState('idle'), 2200);
    return () => window.clearTimeout(timeout);
  }, [saveState]);

  async function saveWithFallback(action) {
    setSaveState('saving');
    setDataError('');
    try {
      await action(serviceInfo.service);
      setSaveState('saved');
    } catch {
      setDataError('Cloud opslaan mislukt. Je wijziging staat lokaal op dit apparaat.');
      setSaveState('local');
    }
  }

  function startProgram(program) {
    if (activeWorkoutDraft && !window.confirm('Er staat nog een actieve training open. Nieuwe training starten en de oude overschrijven?')) {
      return;
    }
    setCompletedSession(null);
    setActiveWorkoutDraft(null);
    saveWithFallback((service) => service.saveActiveWorkout(null));
    setActiveProgram(program);
  }

  function resumeActiveWorkout() {
    const program = programs.find((item) => item.id === activeWorkoutDraft?.programId);
    if (!program) {
      window.alert('Het opgeslagen schema voor deze actieve training is niet gevonden.');
      return;
    }
    setCompletedSession(null);
    setActiveProgram(program);
  }

  function updateActiveWorkout(nextDraft) {
    setActiveWorkoutDraft(nextDraft);
    localDataService.saveActiveWorkout(nextDraft);
    if (dataMode === 'firestore') saveWithFallback((service) => service.saveActiveWorkout(nextDraft));
  }

  function completeSession(session) {
    const nextSessions = [session, ...storedSessions.filter((item) => item.id !== session.id)];
    setStoredSessions(nextSessions);
    setCompletedSession(session);
    setActiveProgram(null);
    setActiveWorkoutDraft(null);
    setActiveTab('training');
    localDataService.saveSession(session);
    localDataService.saveActiveWorkout(null);
    saveWithFallback((service) => service.saveSession(session).then(() => service.saveActiveWorkout(null)));
  }

  function updateCompletedSession(session) {
    const nextSession = { ...session, updatedAt: new Date().toISOString() };
    setStoredSessions((current) => current.map((item) => (item.id === nextSession.id ? nextSession : item)));
    localDataService.updateSession(nextSession);
    saveWithFallback((service) => service.updateSession(nextSession));
  }

  function deleteCompletedSession(sessionId) {
    setStoredSessions((current) => current.filter((item) => item.id !== sessionId));
    localDataService.deleteSession(sessionId);
    saveWithFallback((service) => service.deleteSession(sessionId));
  }

  function deleteIncompleteTestSessions() {
    const targets = storedSessions.filter((session) => isIncompleteTestSession(session, programs)).map((session) => session.id);
    if (!targets.length) return 0;
    setStoredSessions((current) => current.filter((session) => !targets.includes(session.id)));
    localDataService.deleteSessions(targets);
    saveWithFallback((service) => service.deleteSessions(targets));
    return targets.length;
  }

  function resetActiveWorkout() {
    setActiveProgram(null);
    setActiveWorkoutDraft(null);
    localDataService.resetActiveWorkout();
    saveWithFallback((service) => service.resetActiveWorkout());
  }

  function resetSessionsOnly() {
    setStoredSessions([]);
    setCompletedSession(null);
    localDataService.resetSessions();
    saveWithFallback((service) => service.resetSessions());
  }

  function resetAllLocalData() {
    setPrograms(seedPrograms);
    setStoredSessions([]);
    resetActiveWorkout();
    setCompletedSession(null);
    localDataService.resetAll();
    saveWithFallback((service) => service.resetAll());
  }

  function updatePrograms(nextPrograms) {
    setPrograms(nextPrograms);
    localDataService.savePrograms(nextPrograms);
    saveWithFallback((service) => service.savePrograms(nextPrograms));
  }

  function resetProgramsToCurrentSchema() {
    setPrograms(seedPrograms);
    localDataService.savePrograms(seedPrograms);
    saveWithFallback((service) => service.savePrograms(seedPrograms));
  }

  function updateSettings(partialSettings) {
    const normalized = normalizeSettings({ ...settings, ...partialSettings }, dataMode === 'local');
    setSettings(normalized);
    localDataService.saveSettings(normalized);
    saveWithFallback((service) => service.updateSettings({ vibrationEnabled: normalized.vibrationEnabled }));
  }

  function importLocalData(data) {
    if (!data || !Array.isArray(data.programs) || !Array.isArray(data.sessions)) {
      throw new Error('Ongeldig backupbestand.');
    }
    setPrograms(data.programs);
    setStoredSessions(data.sessions);
    setActiveWorkoutDraft(data.activeWorkout || null);
    setSettings(normalizeSettings(data.settings || defaultSettings, dataMode === 'local'));
    setActiveProgram(null);
    setCompletedSession(null);
    localDataService.savePrograms(data.programs);
    localDataService.replaceSessions(data.sessions);
    localDataService.saveActiveWorkout(data.activeWorkout || null);
    localDataService.saveSettings(data.settings || defaultSettings);
    saveWithFallback((service) =>
      Promise.all([
        service.savePrograms(data.programs),
        service.replaceSessions(data.sessions),
        service.saveActiveWorkout(data.activeWorkout || null),
        service.saveSettings(data.settings || defaultSettings),
      ]),
    );
  }

  function exportLocalData() {
    return {
      exportedAt: new Date().toISOString(),
      app: 'DailyProgress',
      version: 1,
      programs,
      sessions: storedSessions,
      activeWorkout: activeWorkoutDraft,
      settings,
    };
  }

  async function migrateLocalData(copy) {
    if (!auth.user || dataMode !== 'firestore') {
      setMigrationPrompt(null);
      return;
    }
    if (copy) {
      await saveWithFallback((service) => service.migrateLocalData(migrationPrompt));
      setPrograms(migrationPrompt.programs?.length ? migrationPrompt.programs : seedPrograms);
      setStoredSessions(migrationPrompt.sessions || []);
      setActiveWorkoutDraft(migrationPrompt.activeWorkout || null);
      setSettings(normalizeSettings(migrationPrompt.settings || defaultSettings, false));
    }
    setMigrationPrompt(null);
  }

  async function logout() {
    await auth.logout();
    setActiveProgram(null);
    setActiveWorkoutDraft(null);
    setDataMode('local');
  }

  if (auth.authLoading) {
    return <Splash text="Authenticatie laden..." />;
  }

  if (!auth.user && !auth.localOnlyMode) {
    return <AuthPage auth={auth} />;
  }

  if (dataLoading) {
    return <Splash text="Data laden..." />;
  }

  if (activeProgram) {
    return (
      <AppLayout
        activeTab={activeTab}
        onTabChange={(nextTab) => {
          setActiveProgram(null);
          setActiveTab(nextTab);
        }}
      >
        <ActiveWorkoutPage
          program={activeProgram}
          sessions={allSessions}
          initialDraft={activeWorkoutDraft?.programId === activeProgram.id ? activeWorkoutDraft : null}
          vibrationEnabled={settings.vibrationEnabled}
          onDraftChange={updateActiveWorkout}
          onCancel={() => setActiveProgram(null)}
          onStopWorkout={resetActiveWorkout}
          onComplete={completeSession}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <StatusBar
        mode={dataMode}
        user={auth.user}
        saveState={saveState}
        error={dataError}
        onLogout={logout}
        onLogin={auth.leaveLocalOnly}
      />
      {migrationPrompt && <MigrationPrompt onCopy={() => migrateLocalData(true)} onSkip={() => migrateLocalData(false)} />}
      {activeTab === 'training' && (
        <TrainingPage
          programs={programs}
          sessions={allSessions}
          onStart={startProgram}
          activeWorkoutDraft={activeWorkoutDraft}
          onResumeWorkout={resumeActiveWorkout}
          onDiscardWorkout={resetActiveWorkout}
          completedSession={completedSession}
          saveState={saveState}
        />
      )}
      {activeTab === 'progress' && (
        <ProgressPage
          programs={programs}
          sessions={allSessions}
          onUpdateSession={updateCompletedSession}
          onDeleteSession={deleteCompletedSession}
        />
      )}
      {activeTab === 'insights' && <InsightsPage sessions={allSessions} />}
      {activeTab === 'program' && (
        <ProgramPage
          programs={programs}
          onProgramsChange={updatePrograms}
          onResetProgramsToCurrentSchema={resetProgramsToCurrentSchema}
          settings={settings}
          onSettingsChange={updateSettings}
          exportLocalData={exportLocalData}
          importLocalData={importLocalData}
          resetActiveWorkout={resetActiveWorkout}
          resetSessionsOnly={resetSessionsOnly}
          resetAllLocalData={resetAllLocalData}
          incompleteTestSessionCount={storedSessions.filter((session) => isIncompleteTestSession(session, programs)).length}
          deleteIncompleteTestSessions={deleteIncompleteTestSessions}
        />
      )}
    </AppLayout>
  );
}

function Splash({ text }) {
  return (
    <AppLayout activeTab="training" onTabChange={() => {}} hideNav>
      <div className="flex min-h-dvh items-center justify-center px-4 text-center">
        <p className="text-sm font-bold text-zinc-400">{text}</p>
      </div>
    </AppLayout>
  );
}

function StatusBar({ mode, user, saveState, error, onLogout, onLogin }) {
  const saveLabel = {
    saving: 'Opslaan...',
    saved: 'Opgeslagen',
    local: 'Offline/lokaal opgeslagen',
  }[saveState];

  return (
    <div className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 px-4 py-2 backdrop-blur">
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="min-w-0">
          <p className="truncate font-bold text-zinc-300">
            {mode === 'firestore' ? user?.email : 'Lokale modus'}
            {saveLabel ? ` · ${saveLabel}` : ''}
          </p>
          {error && <p className="mt-1 text-amber-200">{error}</p>}
        </div>
        <button type="button" onClick={mode === 'firestore' ? onLogout : onLogin} className="shrink-0 font-bold text-emerald-300">
          {mode === 'firestore' ? 'Logout' : 'Login'}
        </button>
      </div>
    </div>
  );
}

function MigrationPrompt({ onCopy, onSkip }) {
  return (
    <div className="mx-4 mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4">
      <h2 className="font-black text-emerald-50">Lokale data gevonden</h2>
      <p className="mt-1 text-sm leading-5 text-emerald-100/80">Wil je deze naar je account kopiëren?</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={onCopy} className="min-h-11 rounded-md bg-emerald-400 text-sm font-bold text-zinc-950">
          Ja, kopieer
        </button>
        <button type="button" onClick={onSkip} className="min-h-11 rounded-md bg-zinc-800 text-sm font-bold text-zinc-200">
          Nee, start schoon
        </button>
      </div>
    </div>
  );
}
