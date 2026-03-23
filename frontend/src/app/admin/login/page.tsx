import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdminLoginClient from './AdminLoginClient'

export const metadata: Metadata = { title: 'Admin Login' }

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <AdminLoginClient />
        </Suspense>
    )
}
