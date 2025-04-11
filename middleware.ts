import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    '/dashboard(.*)', // protect dashboard
    '/profile(.*)',
    '/api/(.*)',
    '/trpc/(.*)',
    // Allow static/public files to pass through
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
};
