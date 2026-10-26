import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { fetchNoteById } from '@/lib/api/serverApi';
import NotePreviewClient from './NotePreview.client';

interface NotePreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePreviewPage({ params }: NotePreviewPageProps) {
  const { id } = await params;
  const client = new QueryClient();
  await client.prefetchQuery({ queryKey: ['note', id], queryFn: () => fetchNoteById(id) });
  return (
    <HydrationBoundary state={dehydrate(client)}>
      <NotePreviewClient />
    </HydrationBoundary>
  );
}
