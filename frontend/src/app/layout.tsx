import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: {
        default: 'Recipe Platform',
        template: '%s | Recipe Platform',
    },
    description: 'Discover and share amazing recipes from around the world.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    )
}
