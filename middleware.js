export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
