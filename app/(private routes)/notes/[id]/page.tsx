import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { fetchNoteById } from '@/lib/api/serverApi';
import NoteDetailsClient from './NoteDetails.client';
interface NotePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { id } = await params;
  const note = await fetchNoteById(id);
  const title = `${note.title} | NoteHub`;
  const description =
    note.content.replace(/\s+/g, ' ').trim().slice(0, 160) || 'View this note in NoteHub.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://08-zustand-psi-two.vercel.app/notes/${encodeURIComponent(id)}`,
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

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const client = new QueryClient();
  await client.prefetchQuery({ queryKey: ['note', id], queryFn: () => fetchNoteById(id) });
  return (
    <HydrationBoundary state={dehydrate(client)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
