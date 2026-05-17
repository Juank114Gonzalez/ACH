import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel';
import { AuthGuard } from '@/features/auth/components/AuthGuard';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen">
        <AuthBrandPanel />
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <span className="text-base font-bold text-white">A</span>
              </div>
              <span className="text-lg font-bold">ACH Finance</span>
            </div>
            <LoginForm />
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
