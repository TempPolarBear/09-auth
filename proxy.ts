import { NextResponse, type NextRequest } from 'next/server';
import { parseSetCookie } from 'cookie';
import { checkSession, getMe } from '@/lib/api/serverApi';

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPrivate = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isPublic = publicRoutes.includes(pathname);
  const refreshedCookies: string[] = [];
  let authenticated = false;

  if (request.cookies.has('accessToken') || request.cookies.has('refreshToken')) {
    try {
      const session = await checkSession(request.cookies.toString());
      const data = session.data;
      const valid = Boolean(data && ('success' in data ? data.success : data.email));
      if (valid) {
        const setCookie = session.headers['set-cookie'];
        if (setCookie)
          refreshedCookies.push(...(Array.isArray(setCookie) ? setCookie : [setCookie]));
        for (const value of refreshedCookies) {
          const parsed = parseSetCookie(value);
          if (parsed.value) request.cookies.set(parsed.name, parsed.value);
        }
        await getMe(request.cookies.toString());
        authenticated = true;
      }
    } catch {
      authenticated = false;
    }
  }

  let response: NextResponse;
  if (isPrivate && !authenticated) {
    response = NextResponse.redirect(new URL('/sign-in', request.url));
  } else if (isPublic && authenticated) {
    response = NextResponse.redirect(new URL('/profile', request.url));
  } else {
    const headers = new Headers(request.headers);
    headers.set('cookie', request.cookies.toString());
    response = NextResponse.next({ request: { headers } });
  }

  for (const value of refreshedCookies) response.headers.append('set-cookie', value);
  return response;
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
