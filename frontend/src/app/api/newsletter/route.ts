import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiPaginated, apiSuccess, apiError } from '@/lib/api-auth'
import { z } from 'zod'

// POST /api/newsletter/subscribe — Public
export async function POST(request: Request) {
    const schema = z.object({
        email: z.string().email(),
        name: z.string().optional(),
    })

    try {
        const body = await request.json()
        const { email, name } = schema.parse(body)

        await prisma.newsletter.upsert({
            where: { email },
            create: { email, name, status: 'ACTIVE' },
            update: { status: 'ACTIVE', name: name || undefined },
        })

        return apiSuccess(null, 'Subscribed successfully')
    } catch (err) {
        if (err instanceof z.ZodError) return apiError(err.errors[0].message)
        return apiError('Failed to subscribe', 500)
    }
}

// GET /api/newsletter/subscribers — Admin
export async function GET(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
        const status = searchParams.get('status') as 'ACTIVE' | 'UNSUBSCRIBED' | null

        const where = status ? { status } : {}

        const [total, subscribers] = await Promise.all([
            prisma.newsletter.count({ where }),
            prisma.newsletter.findMany({
                where, skip: (page - 1) * limit, take: limit,
                orderBy: { subscribedAt: 'desc' },
            }),
        ])

        return apiPaginated(subscribers, total, page, limit)
    } catch { return apiError('Server error', 500) }
}
