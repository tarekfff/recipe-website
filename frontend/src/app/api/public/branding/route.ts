import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Public endpoint — no auth required
// Returns site branding info (name, logo) for use in Navbar/Footer
export async function GET() {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: 'singleton' },
            select: {
                siteName: true,
                logo: true,
                socialLinks: true,
            }
        })

        return NextResponse.json({
            siteName: settings?.siteName || 'Recipe Platform',
            logo: settings?.logo || null,
            socialLinks: settings?.socialLinks || null,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            }
        })
    } catch {
        return NextResponse.json({
            siteName: 'Recipe Platform',
            logo: null,
            socialLinks: null,
        })
    }
}
