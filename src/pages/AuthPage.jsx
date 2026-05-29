import { AppLayout } from '../components/layout/AppLayout';
import { AuthForm } from '../components/auth/AuthForm';

export function AuthPage({ auth }) {
  return (
    <AppLayout activeTab="training" onTabChange={() => {}} hideNav>
      <div className="flex min-h-dvh items-start justify-center px-4 py-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:items-center">
        <AuthForm
          error={auth.authError}
          firebaseConfigured={auth.firebaseConfigured}
          onLogin={auth.login}
          onRegister={auth.register}
          onLocalOnly={auth.continueLocalOnly}
        />
      </div>
    </AppLayout>
  );
}
