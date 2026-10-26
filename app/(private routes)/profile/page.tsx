import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getMe } from '@/lib/api/serverApi';
import css from './ProfilePage.module.css';

export const metadata: Metadata = {
  title: 'Profile | NoteHub',
  description: 'View your NoteHub profile and account information.',
  openGraph: {
    title: 'Profile | NoteHub',
    description: 'View your NoteHub profile and account information.',
    url: 'https://09-auth-seven-jade.vercel.app/profile',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1536,
        height: 1024,
        alt: 'NoteHub application preview',
      },
    ],
  },
};

export default async function ProfilePage() {
  const user = await getMe();
  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>
        <div className={css.avatarWrapper}>
          <Image
            src={user.avatar}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        </div>
        <div className={css.profileInfo}>
          <div className={css.usernameWrapper}>
            <p>Username: {user.username}</p>
          </div>
          <p>Email: {user.email}</p>
        </div>
      </div>
    </main>
  );
}
