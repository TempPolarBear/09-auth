import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getFilterTag } from '@/lib/noteFilters';
import { fetchNotes } from '@/lib/api/serverApi';

const NOTES_PER_PAGE = 12;
import NotesClient from './Notes.client';

interface NotesPageProps {
  params: Promise<{ slug: string[] }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: NotesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = getFilterTag(slug);
  const filter = tag ?? 'all';
  const title = tag ? `${tag} notes | NoteHub` : 'All notes | NoteHub';
  const description = tag
    ? `Browse and manage your ${tag} notes in NoteHub.`
    : 'Browse and manage all your notes in NoteHub.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://08-zustand-psi-two.vercel.app/notes/filter/${filter}`,
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
}

export default async function NotesPage({ params }: NotesPageProps) {
  const { slug } = await params;
  const tag = getFilterTag(slug);
  const filter = tag ?? 'all';

  const client = new QueryClient();
  await client.prefetchQuery({
    queryKey: ['notes', 1, NOTES_PER_PAGE, '', tag],
    queryFn: () => fetchNotes({ page: 1, perPage: NOTES_PER_PAGE, search: '', tag }),
  });
  return (
    <HydrationBoundary state={dehydrate(client)}>
      <NotesClient key={filter} tag={tag} />
    </HydrationBoundary>
  );
}
