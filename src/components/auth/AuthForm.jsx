import { LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function AuthForm({ mode, error, firebaseConfigured, onLogin, onRegister, onLocalOnly }) {
  const [authMode, setAuthMode] = useState(mode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (authMode === 'login') await onLogin(email, password);
      else await onRegister(email, password);
    } catch {
      // useAuth exposes a user-facing error message.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-4">
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
          onClick={() => setAuthMode('login')}
          className={[
            'min-h-11 rounded-md text-sm font-bold',
            authMode === 'login' ? 'bg-emerald-400 text-zinc-950' : 'bg-zinc-800 text-zinc-300',
          ].join(' ')}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('register')}
          className={[
            'min-h-11 rounded-md text-sm font-bold',
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
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-emerald-400"
          placeholder="E-mail"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-emerald-400"
          placeholder="Wachtwoord"
          minLength={6}
          required
        />
        {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting || !firebaseConfigured}>
          {authMode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
          {authMode === 'login' ? 'Inloggen' : 'Registreren'}
        </Button>
      </form>
      <Button variant="secondary" className="w-full" onClick={onLocalOnly}>
        Doorgaan zonder account
      </Button>
    </Card>
  );
}
