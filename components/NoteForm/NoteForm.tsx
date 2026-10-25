'use client';

import { useRef, useState, useSyncExternalStore, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote, type CreateNotePayload } from '@/lib/api/clientApi';
import { isNoteTag, noteTags } from '@/lib/noteTags';
import { useNoteStore } from '@/lib/store/noteStore';
import css from './NoteForm.module.css';

const subscribeToClient = () => () => {};

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useNoteStore((state) => state.draft);
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);
  const hydrated = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const submitting = useRef(false);
  const mutation = useMutation({ mutationFn: createNote });

  const formAction = async (formData: FormData): Promise<void> => {
    if (submitting.current) return;
    const titleValue = formData.get('title');
    const contentValue = formData.get('content');
    const tagValue = formData.get('tag');
    const title = typeof titleValue === 'string' ? titleValue.trim() : '';
    const content = typeof contentValue === 'string' ? contentValue.trim() : '';
    const tag = typeof tagValue === 'string' ? tagValue : '';

    if (title.length < 3 || title.length > 50 || content.length > 500 || !isNoteTag(tag)) {
      setFormError('Check the title, content, and tag before creating the note.');
      return;
    }

    const payload: CreateNotePayload = { title, content, tag };
    setFormError(null);
    submitting.current = true;
    try {
      await mutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      clearDraft();
      router.push('/notes/filter/all');
    } catch {
      setFormError('Could not create the note. Please try again.');
    } finally {
      submitting.current = false;
    }
  };

  if (!hydrated) return <p>Loading draft…</p>;

  return (
    <form className={css.form} action={formAction}>
      <label className={css.formGroup} htmlFor="title">
        Title
        <input
          id="title"
          name="title"
          className={css.input}
          defaultValue={draft.title}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraft({ title: event.target.value })
          }
          required
          minLength={3}
          maxLength={50}
        />
      </label>
      <label className={css.formGroup} htmlFor="content">
        Content
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          defaultValue={draft.content}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setDraft({ content: event.target.value })
          }
          maxLength={500}
        />
      </label>
      <label className={css.formGroup} htmlFor="tag">
        Tag
        <select
          id="tag"
          name="tag"
          className={css.select}
          defaultValue={draft.tag}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            if (isNoteTag(event.target.value)) setDraft({ tag: event.target.value });
          }}
          required
        >
          {noteTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>
      {formError && (
        <p className={css.error} role="alert">
          {formError}
        </p>
      )}
      <div className={css.actions}>
        <button type="button" className={css.cancelButton} onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className={css.submitButton} disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create note'}
        </button>
      </div>
    </form>
  );
}
