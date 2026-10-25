import { cookies } from 'next/headers';
import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';
import { api } from './api';

interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: NoteTag;
}

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

interface SessionResponse {
  success: boolean;
}

async function cookieHeaders(cookieHeader?: string) {
  return { Cookie: cookieHeader ?? (await cookies()).toString() };
}

export async function fetchNotes(params: FetchNotesParams): Promise<FetchNotesResponse> {
  const { data } = await api.get<FetchNotesResponse>('/notes', {
    params,
    headers: await cookieHeaders(),
  });
  return data;
}

export async function fetchNoteById(id: Note['id']): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${encodeURIComponent(id)}`, {
    headers: await cookieHeaders(),
  });
  return data;
}

export async function getMe(cookieHeader?: string): Promise<User> {
  const { data } = await api.get<User>('/users/me', {
    headers: await cookieHeaders(cookieHeader),
  });
  return data;
}

// Keep response headers so Proxy can forward refreshed session cookies.
export async function checkSession(cookieHeader?: string) {
  return api.get<SessionResponse | User | '' | null>('/auth/session', {
    headers: await cookieHeaders(cookieHeader),
  });
}
