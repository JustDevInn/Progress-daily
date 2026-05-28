import { seedPrograms } from '../data/seedPrograms';

export const LOCAL_PROGRAMS_KEY = 'dailyprogress.programs.v1';
export const LOCAL_SESSIONS_KEY = 'dailyprogress.sessions.v2';
export const LOCAL_ACTIVE_WORKOUT_KEY = 'dailyprogress.activeWorkout.v1';
export const LOCAL_SETTINGS_KEY = 'dailyprogress.settings.v1';
export const defaultLocalSettings = {
  vibrationEnabled: false,
  localOnlyMode: true,
};

export function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalJson(key, value) {
  if (value === null || value === undefined) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
}

export const localDataService = {
  async loadData() {
    return {
      programs: readLocalJson(LOCAL_PROGRAMS_KEY, seedPrograms),
      sessions: readLocalJson(LOCAL_SESSIONS_KEY, []),
      activeWorkout: readLocalJson(LOCAL_ACTIVE_WORKOUT_KEY, null),
      settings: normalizeSettings(readLocalJson(LOCAL_SETTINGS_KEY, defaultLocalSettings), true),
    };
  },
  async savePrograms(programs) {
    writeLocalJson(LOCAL_PROGRAMS_KEY, programs);
  },
  async saveSession(session) {
    const sessions = readLocalJson(LOCAL_SESSIONS_KEY, []);
    writeLocalJson(LOCAL_SESSIONS_KEY, [session, ...sessions.filter((item) => item.id !== session.id)]);
  },
  async updateSession(session) {
    const sessions = readLocalJson(LOCAL_SESSIONS_KEY, []);
    writeLocalJson(
      LOCAL_SESSIONS_KEY,
      sessions.map((item) => (item.id === session.id ? session : item)),
    );
  },
  async deleteSession(sessionId) {
    const sessions = readLocalJson(LOCAL_SESSIONS_KEY, []);
    writeLocalJson(
      LOCAL_SESSIONS_KEY,
      sessions.filter((item) => item.id !== sessionId),
    );
  },
  async deleteSessions(sessionIds) {
    const ids = new Set(sessionIds);
    const sessions = readLocalJson(LOCAL_SESSIONS_KEY, []);
    writeLocalJson(
      LOCAL_SESSIONS_KEY,
      sessions.filter((item) => !ids.has(item.id)),
    );
  },
  async replaceSessions(sessions) {
    writeLocalJson(LOCAL_SESSIONS_KEY, sessions);
  },
  async saveActiveWorkout(activeWorkout) {
    writeLocalJson(LOCAL_ACTIVE_WORKOUT_KEY, activeWorkout);
  },
  async getSettings() {
    return normalizeSettings(readLocalJson(LOCAL_SETTINGS_KEY, defaultLocalSettings), true);
  },
  async saveSettings(settings) {
    writeLocalJson(LOCAL_SETTINGS_KEY, normalizeSettings(settings, true));
  },
  async updateSettings(partialSettings) {
    const current = await this.getSettings();
    const next = normalizeSettings({ ...current, ...partialSettings }, true);
    writeLocalJson(LOCAL_SETTINGS_KEY, next);
    return next;
  },
  async resetActiveWorkout() {
    localStorage.removeItem(LOCAL_ACTIVE_WORKOUT_KEY);
  },
  async resetSessions() {
    localStorage.removeItem(LOCAL_SESSIONS_KEY);
  },
  async resetAll() {
    localStorage.removeItem(LOCAL_PROGRAMS_KEY);
    localStorage.removeItem(LOCAL_SESSIONS_KEY);
    localStorage.removeItem(LOCAL_ACTIVE_WORKOUT_KEY);
    localStorage.removeItem(LOCAL_SETTINGS_KEY);
  },
};

export function normalizeSettings(settings = {}, localOnlyMode = true) {
  return {
    vibrationEnabled: Boolean(settings.vibrationEnabled ?? settings.vibrateOnRestDone),
    localOnlyMode,
  };
}
