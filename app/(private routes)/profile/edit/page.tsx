'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { updateMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') ?? '').trim();
    if (!username) {
      setError('Please enter a username.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const updatedUser = await updateMe({ username });
      setUser(updatedUser);
      router.push('/profile');
      router.refresh();
    } catch (error: unknown) {
      setError(
        isAxiosError(error) && error.response?.status === 400
          ? 'Please check your username.'
          : 'Could not update your profile. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  if (!user) return <p>Loading profile…</p>;

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>
        <Image
          src={user.avatar}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />
        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username</label>
            <input
              key={user.email}
              className={css.input}
              id="username"
              name="username"
              defaultValue={user.username}
              autoComplete="username"
              required
            />
          </div>
          <p>Email: {user.email}</p>
          {error && <p role="alert">{error}</p>}
          <div className={css.actions}>
            <button className={css.saveButton} type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button
              className={css.cancelButton}
              type="button"
              disabled={pending}
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
