import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pages that don't require authentication
const publicPages = ['/auth', '/test'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if the current page is public
  const isPublicPage = publicPages.includes(req.nextUrl.pathname);

  // If user is not signed in and the current page is not public,
  // redirect the user to /auth
  if (!session && !isPublicPage) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and the current path is /auth,
  // redirect the user to /dashboard
  if (session && req.nextUrl.pathname === '/auth') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 