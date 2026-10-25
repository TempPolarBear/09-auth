'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchNoteById } from '@/lib/api/clientApi';
import Modal from '@/components/Modal/Modal';
import css from './NotePreview.module.css';

export default function NotePreviewClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const close = useCallback(() => router.back(), [router]);
  const {
    data: note,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
  });

  return (
    <Modal onClose={close} label="Note preview">
      <button type="button" className={css.backBtn} onClick={close}>
        Close
      </button>
      {isPending && <p>Loading, please wait...</p>}
      {isError && <p>Something went wrong.</p>}
      {note && (
        <div className={css.container}>
          <div className={css.item}>
            <div className={css.header}>
              <h2>{note.title}</h2>
            </div>
            <p className={css.tag}>{note.tag}</p>
            <p className={css.content}>{note.content}</p>
            <p className={css.date}>
              Created: {new Date(note.createdAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
