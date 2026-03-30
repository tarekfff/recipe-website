import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export const dynamic = 'force-dynamic'

export default async function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) redirect('/admin/login')

    return (
        <SessionProvider session={session}>
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <main className="flex-1 ml-64 min-h-screen">
                    {children}
                </main>
            </div>
            <Toaster position="top-right" richColors />
        </SessionProvider>
    )
}
