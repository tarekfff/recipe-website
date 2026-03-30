import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith('/admin/login')
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    if (isAuthPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl))
        }
        return NextResponse.next()
    }

    if (isAdminRoute && !isLoggedIn) {
        let from = req.nextUrl.pathname
        if (req.nextUrl.search) {
            from += req.nextUrl.search
        }

        return NextResponse.redirect(
            new URL(`/admin/login?callbackUrl=${encodeURIComponent(from)}`, req.nextUrl)
        )
    }

    // Redirect /admin to /admin/dashboard
    if (req.nextUrl.pathname === '/admin' && isLoggedIn) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl))
    }

    return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
