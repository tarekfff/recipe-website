// This layout covers /admin/login only.
// Protected admin pages use the (protected)/layout.tsx which has auth.
export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
