import { useEffect, useMemo, useState } from 'react';
import { mockSessions } from '../data/mockSessions';

const STORAGE_KEY = 'dailyprogress.sessions.v2';

export function useLocalSessions() {
  const [storedSessions, setStoredSessions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSessions));
  }, [storedSessions]);

  const sessions = useMemo(() => [...mockSessions, ...storedSessions], [storedSessions]);

  function addSession(session) {
    setStoredSessions((current) => [session, ...current]);
  }

  function resetStoredSessions() {
    localStorage.removeItem(STORAGE_KEY);
    setStoredSessions([]);
  }

  function replaceStoredSessions(nextSessions) {
    setStoredSessions(nextSessions);
  }

  return { sessions, storedSessions, addSession, resetStoredSessions, replaceStoredSessions };
}
