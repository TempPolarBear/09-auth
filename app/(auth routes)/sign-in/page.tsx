'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { login } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from './SignInPage.module.css';

export default function SignInPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    setPending(true);
    setError('');
    try {
      const user = await login({ email, password });
      await queryClient.cancelQueries();
      queryClient.clear();
      setUser(user);
      router.push('/profile');
      router.refresh();
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError('An account with this email already exists.');
      } else if (isAxiosError(error) && error.response?.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('Could not log in. Please check your details and try again.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={css.mainContent}>
      <form className={css.form} onSubmit={handleSubmit}>
        <h1 className={css.formTitle}>Log in</h1>
        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            className={css.input}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            className={css.input}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className={css.actions}>
          <button className={css.submitButton} type="submit" disabled={pending}>
            {pending ? 'Please wait…' : 'Log in'}
          </button>
        </div>
        {error && (
          <p className={css.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
