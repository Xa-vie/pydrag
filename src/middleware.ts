// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import NextAuth from 'next-auth';
import authConfig from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAuth = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/signin');
  const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');

  // Redirect authenticated users away from auth pages
  if (isAuth && isAuthPage) {
    return Response.redirect(new URL('/dashboard', req.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuth && isDashboardPage) {
    return Response.redirect(new URL('/signin', req.url));
  }

  return null;
});

// Update the matcher to include both auth and dashboard paths
export const config = {
  matcher: ['/signin', '/dashboard/:path*']
};
