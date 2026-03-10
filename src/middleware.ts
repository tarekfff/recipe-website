// Lightweight middleware for frontend demo deployment
// Admin auth is disabled since there's no database
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // For the demo, redirect all admin routes to the homepage
    if (request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
