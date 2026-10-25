'use client';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote } from '@/lib/api/clientApi';
import type { Note } from '@/types/note';
import css from './NoteList.module.css';

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['notes'] });
    },
  });
  return (
    <>
      {mutation.isError && <p role="alert">Could not delete the note. Please try again.</p>}
      <ul className={css.list}>
        {notes.map((note) => (
          <li key={note.id} className={css.listItem}>
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <div className={css.footer}>
              <span className={css.tag}>{note.tag}</span>
              <Link className={css.link} href={`/notes/${note.id}`}>
                View details
              </Link>
              <button
                type="button"
                className={css.button}
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(note.id)}
              >
                {mutation.isPending && mutation.variables === note.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
