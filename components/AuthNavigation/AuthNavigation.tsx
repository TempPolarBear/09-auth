'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from './AuthNavigation.module.css';

export default function AuthNavigation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const clearIsAuthenticated = useAuthStore((state) => state.clearIsAuthenticated);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout() {
    setPending(true);
    setError('');
    try {
      await logout();
      await queryClient.cancelQueries();
      queryClient.clear();
      clearIsAuthenticated();
      router.push('/sign-in');
      router.refresh();
    } catch {
      setError('Could not log out. Please try again.');
    } finally {
      setPending(false);
    }
  }

  if (!isInitialized) return null;

  return isAuthenticated ? (
    <>
      <li className={css.navigationItem}>
        <Link href="/profile" prefetch={false} className={css.navigationLink}>
          Profile
        </Link>
      </li>
      <li className={css.navigationItem}>
        <span className={css.userEmail}>{user?.email}</span>
        <button
          type="button"
          className={css.logoutButton}
          onClick={handleLogout}
          disabled={pending}
        >
          {pending ? 'Logging out…' : 'Logout'}
        </button>
        {error && <p role="alert">{error}</p>}
      </li>
    </>
  ) : (
    <>
      <li className={css.navigationItem}>
        <Link href="/sign-in" prefetch={false} className={css.navigationLink}>
          Login
        </Link>
      </li>
      <li className={css.navigationItem}>
        <Link href="/sign-up" prefetch={false} className={css.navigationLink}>
          Sign up
        </Link>
      </li>
    </>
  );
}
