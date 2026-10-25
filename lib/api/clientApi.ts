import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';
import { api } from './api';

export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: NoteTag;
  signal?: AbortSignal;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  username: string;
}

interface SessionResponse {
  success: boolean;
}

export async function fetchNotes({
  signal,
  ...params
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const { data } = await api.get<FetchNotesResponse>('/notes', { params, signal });
  return data;
}

export async function fetchNoteById(id: Note['id']): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${encodeURIComponent(id)}`);
  return data;
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const { data } = await api.post<Note>('/notes', payload);
  return data;
}

export async function deleteNote(id: Note['id']): Promise<Note> {
  const { data } = await api.delete<Note>(`/notes/${encodeURIComponent(id)}`);
  return data;
}

export async function register(payload: AuthRequest): Promise<User> {
  const { data } = await api.post<User>('/auth/register', payload);
  return data;
}

export async function login(payload: AuthRequest): Promise<User> {
  const { data } = await api.post<User>('/auth/login', payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function checkSession(): Promise<boolean> {
  const { data } = await api.get<SessionResponse | User | '' | null>('/auth/session');
  if (!data) return false;
  return 'success' in data ? data.success : Boolean(data.email);
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}

export async function updateMe(payload: UpdateUserRequest): Promise<User> {
  const { data } = await api.patch<User>('/users/me', payload);
  return data;
}
