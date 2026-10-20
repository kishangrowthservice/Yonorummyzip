// middleware.ts — Next.js Edge Middleware
// Protects all /admin/* and /api/admin/* routes.

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase-server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Guard API Admin routes
  if (pathname.startsWith('/api/admin')) {
    const response = NextResponse.next({ request });
    const supabase = createSupabaseMiddlewareClient(request, response);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }
    return response;
  }

  // 2. Guard /admin UI routes
  if (pathname.startsWith('/admin')) {
    // Allow login and auth routes
    if (pathname === '/admin/login' || pathname.startsWith('/admin/auth')) {
      return NextResponse.next();
    }

    const response = NextResponse.next({ request });
    const supabase = createSupabaseMiddlewareClient(request, response);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
