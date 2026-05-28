import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/firebase';

const LOCAL_ONLY_KEY = 'dailyprogress.localOnlyMode.v1';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState('');
  const [localOnlyMode, setLocalOnlyMode] = useState(() => localStorage.getItem(LOCAL_ONLY_KEY) === 'true');

  useEffect(() => {
    if (!isFirebaseConfigured || localOnlyMode) {
      setAuthLoading(false);
      setUser(null);
      return undefined;
    }

    return onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setAuthLoading(false);
      },
      () => {
        setAuthError('Authenticatie laden mislukt.');
        setAuthLoading(false);
      },
    );
  }, [localOnlyMode]);

  async function login(email, password) {
    if (!isFirebaseConfigured || !auth) throw new Error('Firebase is niet geconfigureerd.');
    setAuthError('');
    setLocalOnlyMode(false);
    localStorage.removeItem(LOCAL_ONLY_KEY);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError(authMessage(error));
      throw error;
    }
  }

  async function register(email, password) {
    if (!isFirebaseConfigured || !auth) throw new Error('Firebase is niet geconfigureerd.');
    setAuthError('');
    setLocalOnlyMode(false);
    localStorage.removeItem(LOCAL_ONLY_KEY);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError(authMessage(error));
      throw error;
    }
  }

  async function logout() {
    setAuthError('');
    if (auth && user) await signOut(auth);
    setUser(null);
  }

  function continueLocalOnly() {
    localStorage.setItem(LOCAL_ONLY_KEY, 'true');
    setLocalOnlyMode(true);
    setUser(null);
    setAuthError('');
  }

  function leaveLocalOnly() {
    localStorage.removeItem(LOCAL_ONLY_KEY);
    setLocalOnlyMode(false);
    setAuthLoading(isFirebaseConfigured);
  }

  return {
    user,
    authLoading,
    authError,
    localOnlyMode,
    firebaseConfigured: isFirebaseConfigured,
    login,
    register,
    logout,
    continueLocalOnly,
    leaveLocalOnly,
  };
}

function authMessage(error) {
  if (error?.code === 'auth/invalid-credential') return 'E-mail of wachtwoord klopt niet.';
  if (error?.code === 'auth/email-already-in-use') return 'Dit e-mailadres bestaat al.';
  if (error?.code === 'auth/weak-password') return 'Kies een sterker wachtwoord.';
  return 'Authenticatie mislukt.';
}
