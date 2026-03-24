import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: 'singleton' },
            select: { adsTxt: true }
        })

        const content = settings?.adsTxt || ''

        return new NextResponse(content, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        })
    } catch (error) {
        console.error('Error generating ads.txt:', error)
        return new NextResponse('', {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
    }
}
