import { auth } from '@/auth'

export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth

    const isAdminRoute = pathname.startsWith('/admin')
    const isLoginPage = pathname === '/admin/login'

    if (isAdminRoute && !isLoginPage && !isLoggedIn) {
        const loginUrl = new URL('/admin/login', req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return Response.redirect(loginUrl)
    }

    if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL('/admin/dashboard', req.url))
    }
})

export const config = {
    matcher: ['/admin/:path*'],
}
