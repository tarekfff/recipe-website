import type { Metadata } from 'next'
import { cache } from 'react'
import { prisma } from '@/lib/db'
import { BrandingProvider } from '@/components/BrandingProvider'
import './globals.css'

// Cache the DB fetch so it's only executed once per request
const getSiteSettings = cache(async () => {
    try {
        return await prisma.siteSettings.findUnique({
            where: { id: 'singleton' },
            select: {
                siteName: true,
                logo: true,
                seoTitle: true,
                seoDescription: true,
                seoKeywords: true,
                headerScripts: true,
                footerScripts: true
            }
        })
    } catch (e) {
        console.error('Failed to load global site settings:', e)
        return null
    }
})

// Dynamically generate the Next.js standard Metadata object
export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings()
    return {
        title: {
            default: settings?.seoTitle || settings?.siteName || 'Recipe Platform',
            template: `%s | ${settings?.seoTitle || settings?.siteName || 'Recipe Platform'}`,
        },
        description: settings?.seoDescription || 'Discover and share amazing recipes from around the world.',
        keywords: settings?.seoKeywords || undefined,
    }
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const settings = await getSiteSettings()

    const branding = {
        siteName: settings?.siteName || 'Recipe Platform',
        logo: settings?.logo || null,
    }

    return (
        <html lang="en">
            <head>{settings?.headerScripts ? <script dangerouslySetInnerHTML={{ __html: `</script>${settings.headerScripts}<script>` }} /> : null}</head>
            <body className="antialiased">
                <BrandingProvider initial={branding}>
                    {children}
                </BrandingProvider>

                {settings?.footerScripts ? <div dangerouslySetInnerHTML={{ __html: settings.footerScripts }} /> : null}
            </body>
        </html>
    )
}
