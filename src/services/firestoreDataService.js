import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { seedPrograms } from '../data/seedPrograms';
import { normalizeSettings } from './localDataService';

function ensureReady(userId) {
  if (!isFirebaseConfigured || !db || !userId) throw new Error('Firestore is niet beschikbaar.');
}

function userDoc(userId) {
  return doc(db, 'users', userId);
}

function settingsDoc(userId) {
  return doc(db, 'users', userId, 'settings', 'app');
}

export async function getSettings(userId) {
  ensureReady(userId);
  const ref = settingsDoc(userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return normalizeSettings(stripMeta(snap.data()), false);

  const defaults = normalizeSettings({}, false);
  await setDoc(ref, {
    ...defaults,
    updatedAt: serverTimestamp(),
  });
  return defaults;
}

export async function saveSettings(userId, settings) {
  ensureReady(userId);
  const normalized = normalizeSettings(settings, false);
  await setDoc(settingsDoc(userId), {
    ...normalized,
    updatedAt: serverTimestamp(),
  });
  return normalized;
}

export async function updateSettings(userId, partialSettings) {
  const current = await getSettings(userId);
  return saveSettings(userId, { ...current, ...partialSettings });
}

export function createFirestoreDataService(userId) {
  ensureReady(userId);

  return {
    async loadData() {
      const profileRef = userDoc(userId);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          profile: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            displayName: '',
            appVersion: 'local-mvp',
          },
        });
      }

      const [programSnaps, sessionSnaps, activeSnap, settings] = await Promise.all([
        getDocs(collection(db, 'users', userId, 'programs')),
        getDocs(collection(db, 'users', userId, 'sessions')),
        getDoc(doc(db, 'users', userId, 'activeWorkout', 'current')),
        getSettings(userId),
      ]);

      return {
        programs: programSnaps.empty
          ? seedPrograms
          : programSnaps.docs.map((item) => stripMeta(item.data())).sort((a, b) => a.name.localeCompare(b.name)),
        sessions: sessionSnaps.docs
          .map((item) => stripMeta(item.data()))
          .sort((a, b) => new Date(b.completedAt || b.createdAt || b.date) - new Date(a.completedAt || a.createdAt || a.date)),
        activeWorkout: activeSnap.exists() ? stripMeta(activeSnap.data()) : null,
        settings,
      };
    },
    async savePrograms(programs) {
      const batch = writeBatch(db);
      programs.forEach((program) => {
        batch.set(doc(db, 'users', userId, 'programs', program.id), {
          ...program,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    },
    async saveSession(session) {
      await setDoc(doc(db, 'users', userId, 'sessions', session.id), {
        ...session,
        updatedAt: serverTimestamp(),
      });
    },
    async updateSession(session) {
      await setDoc(doc(db, 'users', userId, 'sessions', session.id), {
        ...session,
        updatedAt: serverTimestamp(),
      });
    },
    async deleteSession(sessionId) {
      await deleteDoc(doc(db, 'users', userId, 'sessions', sessionId));
    },
    async deleteSessions(sessionIds) {
      const batch = writeBatch(db);
      sessionIds.forEach((sessionId) => {
        batch.delete(doc(db, 'users', userId, 'sessions', sessionId));
      });
      await batch.commit();
    },
    async replaceSessions(sessions) {
      const current = await getDocs(collection(db, 'users', userId, 'sessions'));
      const batch = writeBatch(db);
      current.docs.forEach((item) => batch.delete(item.ref));
      sessions.forEach((session) => {
        batch.set(doc(db, 'users', userId, 'sessions', session.id), {
          ...session,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    },
    async saveActiveWorkout(activeWorkout) {
      const ref = doc(db, 'users', userId, 'activeWorkout', 'current');
      if (!activeWorkout) await deleteDoc(ref);
      else await setDoc(ref, { ...activeWorkout, updatedAt: serverTimestamp() });
    },
    async getSettings() {
      return getSettings(userId);
    },
    async saveSettings(settings) {
      return saveSettings(userId, settings);
    },
    async updateSettings(partialSettings) {
      return updateSettings(userId, partialSettings);
    },
    async resetActiveWorkout() {
      await deleteDoc(doc(db, 'users', userId, 'activeWorkout', 'current'));
    },
    async resetSessions() {
      const current = await getDocs(collection(db, 'users', userId, 'sessions'));
      const batch = writeBatch(db);
      current.docs.forEach((item) => batch.delete(item.ref));
      await batch.commit();
    },
    async resetAll() {
      await Promise.all([this.resetSessions(), this.resetActiveWorkout()]);
      const programs = await getDocs(collection(db, 'users', userId, 'programs'));
      const batch = writeBatch(db);
      programs.docs.forEach((item) => batch.delete(item.ref));
      await batch.commit();
    },
    async migrateLocalData(data) {
      await this.savePrograms(data.programs || seedPrograms);
      await this.replaceSessions(data.sessions || []);
      await this.saveActiveWorkout(data.activeWorkout || null);
      await this.saveSettings(data.settings || { vibrationEnabled: false, localOnlyMode: false });
    },
  };
}

function stripMeta(value) {
  const { updatedAt, ...rest } = value || {};
  return rest;
}
