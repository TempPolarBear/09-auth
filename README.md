# NoteHub — GoIT HW09: authentication

A Next.js App Router application with cookie authentication and private notes.
This project continues the accepted HW08 repository at commit
`cbf56db600faa1c31925f9424d170b844fa2b968`.

## Features

- Registration, login, session restoration, and logout with a Zustand auth store
- Protected notes and profile routes through `proxy.ts`
- Server-rendered profile and username editing
- Server-prefetched notes with TanStack Query hydration, tag filters, search, and pagination
- Canonical note pages and intercepted modal previews
- Dedicated note creation page at `/notes/action/create`
- Zustand draft persistence in browser localStorage, including after reload or Cancel
- Dynamic page and Open Graph metadata for filters and individual notes
- Custom 404 page and Roboto through `next/font/google`

## Setup

```bash
npm install
```

Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000`.
For Vercel Production and Preview, set `NEXT_PUBLIC_API_URL` to the production
origin, without a trailing `/api`, and redeploy after changing it.
Local environment files are ignored by Git.

```bash
npm run dev
```

## Routes

- `/` — welcome page
- `/sign-in`, `/sign-up` — public authentication pages
- `/profile`, `/profile/edit` — protected profile pages
- `/notes/filter/all` — all notes without an API tag parameter
- `/notes/filter/Todo`, `/notes/filter/Work`, `/notes/filter/Personal`,
  `/notes/filter/Meeting`, `/notes/filter/Shopping` — filtered notes
- `/notes/[id]` — canonical note details
- `/notes/action/create` — native creation form with a persisted draft

Soft navigation to a note opens the interception preview. Direct navigation or
reload shows the full detail page. The shared Modal remains in use for previews.
Canceling creation returns to the previous page and keeps the draft. Successful
creation clears it, invalidates note lists, and redirects to all notes.

Notes CSS Modules are preserved from HW08. Authentication and profile CSS Modules
come from the official
[GoIT hw-09-styles branch](https://github.com/goitacademy/react-notehub-styles/tree/hw-09-styles).
The custom 404 stylesheet continues from HW07. See `STYLES-LICENSE`.

## API and session flow

`lib/api/api.ts` exports the shared Axios client with credentials enabled.
Client components use `clientApi.ts`; server components use `serverApi.ts`, which
forwards incoming cookies. The browser talks to this application's `/api` routes.

`app/api` is copied unchanged from the official
[GoIT hw-09-api-files branch](https://github.com/goitacademy/react-notehub-styles/tree/hw-09-api-files)
and proxies `https://notehub-api.goit.study`. The supplied API and new official CSS
files are excluded from Prettier to preserve their original contents.

The notes layout inside the private group owns both notes and the modal slot. Root provider nesting is
`TanStackProvider > AuthProvider > Header / route content (including modal) / Footer`.
Authentication is restored from cookies; only the note draft persists in localStorage.
Proxy forwards refreshed cookies to both the current SSR request and the browser.

## Validation

```bash
npm run lint
npm run build
npm run format:check
npx tsc --noEmit
git diff --check
```
