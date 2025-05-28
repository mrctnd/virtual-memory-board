import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/boards',
];

export function middleware(request) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // If not a protected route, allow the request to proceed
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Check for the JWT token in cookies
  const token = request.cookies.get('jwt')?.value;
  
  // If there's no token and the route is protected, redirect to login
  if (!token) {
    // Create a URL for the login page
    const loginUrl = new URL('/login', request.url);
    
    // Add the redirect path as a search parameter so we can redirect back after login
    loginUrl.searchParams.set('redirectTo', pathname);
    
    // Redirect to the login page
    return NextResponse.redirect(loginUrl);
  }
  
  // If there's a token, allow the request to proceed
  return NextResponse.next();
}

// Configure which paths the middleware applies to
export const config = {
  matcher: [
    // Apply to all routes except _next, api, static files, etc.
    '/((?!_next/|_vercel|api/|static/|public/|favicon.ico|robots.txt).*)',
  ],
}; 