import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, verifyAuth } from '@/lib/api-auth'
import { z } from 'zod'

// Validation schema for the site settings API payload
const settingsSchema = z.object({
    seoTitle: z.string().nullable().optional(),
    seoDescription: z.string().nullable().optional(),
    seoKeywords: z.string().nullable().optional(),
    headerScripts: z.string().nullable().optional(),
    footerScripts: z.string().nullable().optional(),
    adsTxt: z.string().nullable().optional(),
})

export async function GET(req: Request) {
    try {
        // Only SUPER_ADMIN can view settings in the admin panel
        const user = await verifyAuth(req)
        const authError = requireRole(user, 'SUPER_ADMIN')
        if (authError) return authError

        const settings = await prisma.siteSettings.findUnique({
            where: { id: 'singleton' }
        })

        // Return empty settings object if not created yet
        return NextResponse.json({
            success: true,
            data: settings || {
                seoTitle: '',
                seoDescription: '',
                seoKeywords: '',
                headerScripts: '',
                footerScripts: '',
                adsTxt: '',
            }
        })
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
        }
        console.error('API Error (GET /settings):', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        // Enforce SUPER_ADMIN permissions securely
        const user = await verifyAuth(req)
        const authError = requireRole(user, 'SUPER_ADMIN')
        if (authError) return authError

        const body = await req.json()
        const parsed = settingsSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid input data', details: parsed.error.format() },
                { status: 400 }
            )
        }

        const data = parsed.data

        // Upsert the singleton pattern (always id="singleton")
        const updatedSettings = await prisma.siteSettings.upsert({
            where: { id: 'singleton' },
            create: {
                id: 'singleton',
                ...data,
            },
            update: {
                ...data,
            }
        })

        return NextResponse.json({ success: true, data: updatedSettings })
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
        }
        console.error('API Error (POST /settings):', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
