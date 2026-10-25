'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { NOTES_PER_PAGE, notesQueryOptions } from '@/lib/queries';
import type { NoteTag } from '@/types/note';
import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import NoteList from '@/components/NoteList/NoteList';
import css from './notes.module.css';
interface NotesClientProps {
  tag?: NoteTag;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const debounce = useDebouncedCallback((value: string) => {
    setSearch(value.trim());
    setPage(1);
  }, 350);
  useEffect(() => () => debounce.cancel(), [debounce]);
  const query = useQuery({
    ...notesQueryOptions({ page, perPage: NOTES_PER_PAGE, search, tag }),
    placeholderData: keepPreviousData,
  });
  const data = query.data;
  return (
    <main className={css.app}>
      <div className={css.toolbar}>
        <SearchBox
          value={searchInput}
          onChange={(value: string) => {
            setSearchInput(value);
            debounce(value);
          }}
        />
        {data && data.totalPages > 1 && (
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
        <Link className={css.button} href="/notes/action/create">
          Create note +
        </Link>
      </div>
      {query.isPending && <p>Loading notes…</p>}
      {query.isError && <p>Could not load notes.</p>}
      {data && data.notes.length > 0 && <NoteList notes={data.notes} />}
      {query.isSuccess && data?.notes.length === 0 && <p>No notes found.</p>}
    </main>
  );
}
