import { LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function AuthForm({ mode, error, firebaseConfigured, onLogin, onRegister, onLocalOnly }) {
  const [authMode, setAuthMode] = useState(mode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLocalError('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLocalError('Vul je e-mailadres in.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Gebruik minimaal 6 tekens voor je wachtwoord.');
      return;
    }
    setSubmitting(true);
    try {
      if (authMode === 'login') await onLogin(cleanEmail, password);
      else await onRegister(cleanEmail, password);
    } catch {
      // useAuth exposes a user-facing error message.
    } finally {
      setSubmitting(false);
    }
  }

  const visibleError = localError || error;

  return (
    <Card className="w-full max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-black text-zinc-50">DailyProgress</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Log in om later te synchroniseren, of train lokaal zonder account.
        </p>
      </div>
      {!firebaseConfigured && (
        <div className="rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
          Firebase is nog niet geconfigureerd. Lokale modus blijft beschikbaar.
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setAuthMode('login');
            setLocalError('');
          }}
          className={[
            'min-h-12 rounded-md text-sm font-bold transition active:scale-[0.99]',
            authMode === 'login' ? 'bg-emerald-400 text-zinc-950' : 'bg-zinc-800 text-zinc-300',
          ].join(' ')}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('register');
            setLocalError('');
          }}
          className={[
            'min-h-12 rounded-md text-sm font-bold transition active:scale-[0.99]',
            authMode === 'register' ? 'bg-emerald-400 text-zinc-950' : 'bg-zinc-800 text-zinc-300',
          ].join(' ')}
        >
          Account maken
        </button>
      </div>
      <form className="space-y-3" onSubmit={submit}>
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setLocalError('');
          }}
          className="min-h-14 w-full rounded-md border border-zinc-800 bg-zinc-950 px-4 text-base text-zinc-100 outline-none focus:border-emerald-400"
          placeholder="E-mail"
          autoComplete="email"
          inputMode="email"
          enterKeyHint="next"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setLocalError('');
          }}
          className="min-h-14 w-full rounded-md border border-zinc-800 bg-zinc-950 px-4 text-base text-zinc-100 outline-none focus:border-emerald-400"
          placeholder="Wachtwoord"
          autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
          enterKeyHint="go"
          minLength={6}
          required
        />
        {visibleError && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-200">{visibleError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={submitting || !firebaseConfigured}>
          {authMode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
          {submitting ? 'Bezig...' : authMode === 'login' ? 'Inloggen' : 'Registreren'}
        </Button>
      </form>
      <Button variant="secondary" size="lg" className="w-full" onClick={onLocalOnly}>
        Doorgaan zonder account
      </Button>
    </Card>
  );
}
