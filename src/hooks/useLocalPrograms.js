import { useEffect, useState } from 'react';
import { seedPrograms } from '../data/seedPrograms';

const STORAGE_KEY = 'dailyprogress.programs.v1';

export function useLocalPrograms() {
  const [programs, setPrograms] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : seedPrograms;
    } catch {
      return seedPrograms;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
  }, [programs]);

  function resetPrograms() {
    localStorage.removeItem(STORAGE_KEY);
    setPrograms(seedPrograms);
  }

  function replacePrograms(nextPrograms) {
    setPrograms(nextPrograms);
  }

  return { programs, setPrograms, resetPrograms, replacePrograms };
}
