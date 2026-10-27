import { NextResponse, type NextRequest } from 'next/server';
import { parseSetCookie, stringifyCookie } from 'cookie';
import { checkSession } from '@/lib/api/serverApi';

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPrivate = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isPublic = publicRoutes.includes(pathname);
  const hasAccessToken = request.cookies.has('accessToken');
  const hasRefreshToken = request.cookies.has('refreshToken');
  const refreshedCookies: string[] = [];
  let authenticated = hasAccessToken;

  if (!hasAccessToken && hasRefreshToken) {
    try {
      const session = await checkSession(request.cookies.toString());
      const data = session.data;
      const valid = Boolean(data && ('success' in data ? data.success : data.email));
      if (valid) {
        const setCookie = session.headers['set-cookie'];
        if (setCookie)
          refreshedCookies.push(...(Array.isArray(setCookie) ? setCookie : [setCookie]));
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
    if (refreshedCookies.length > 0) {
      const cookies: Record<string, string | undefined> = Object.fromEntries(
        request.cookies.getAll().map(({ name, value }) => [name, value]),
      );

      for (const value of refreshedCookies) {
        const parsed = parseSetCookie(value);
        cookies[parsed.name] = parsed.value;
      }

      headers.set('cookie', stringifyCookie(cookies));
    }
    response = NextResponse.next({ request: { headers } });
  }

  for (const value of refreshedCookies) response.headers.append('set-cookie', value);
  return response;
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
