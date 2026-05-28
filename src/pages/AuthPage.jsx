import { AppLayout } from '../components/layout/AppLayout';
import { AuthForm } from '../components/auth/AuthForm';

export function AuthPage({ auth }) {
  return (
    <AppLayout activeTab="training" onTabChange={() => {}} hideNav>
      <div className="flex min-h-screen items-center px-4 py-8">
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
