import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { parseSetCookie } from 'cookie';
import { checkSession } from '@/lib/api/serverApi';

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPrivate = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isPublic = publicRoutes.includes(pathname);
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;
  let authenticated = Boolean(accessToken);
  let sessionRefreshed = false;

  if (!accessToken && refreshToken) {
    try {
      const session = await checkSession();
      const data = session.data;
      const valid = Boolean(data && ('success' in data ? data.success : data.email));
      const setCookie = session.headers['set-cookie'];

      if (valid && setCookie) {
        const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];

        for (const cookieStr of cookieArray) {
          const parsed = parseSetCookie(cookieStr);
          if (parsed.value) cookieStore.set(parsed.name, parsed.value, parsed);
        }

        authenticated = true;
        sessionRefreshed = true;
      }
    } catch {
      authenticated = false;
    }
  }

  let response: NextResponse;
  if (isPrivate && !authenticated) {
    response = NextResponse.redirect(new URL('/sign-in', request.url));
  } else if (isPublic && authenticated) {
    response = NextResponse.redirect(new URL('/', request.url));
  } else if (isPrivate && sessionRefreshed) {
    response = NextResponse.redirect(request.nextUrl);
  } else {
    response = NextResponse.next();
  }

  return response;
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
