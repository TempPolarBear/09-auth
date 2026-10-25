import { queryOptions } from '@tanstack/react-query';
import { fetchNotes, type FetchNotesParams } from '@/lib/api/clientApi';

export const NOTES_PER_PAGE = 12;

export function notesQueryOptions({ page, perPage, search = '', tag }: FetchNotesParams) {
  return queryOptions({
    queryKey: ['notes', page, perPage, search, tag],
    queryFn: ({ signal }) => fetchNotes({ page, perPage, search, tag, signal }),
    staleTime: 60_000,
  });
}
