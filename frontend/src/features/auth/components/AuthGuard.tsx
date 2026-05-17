'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/** Redirects already-authenticated users away from login/register pages */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) hydrate();
  }, [_hasHydrated, hydrate]);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  return <>{children}</>;
}
