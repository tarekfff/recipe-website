import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiSuccess, apiError } from '@/lib/api-auth'

// GET /api/system/settings
export async function GET(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const settings = await prisma.siteSettings.findFirst()
        return apiSuccess(settings)
    } catch { return apiError('Server error', 500) }
}

// PUT /api/system/settings
export async function PUT(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'SUPER_ADMIN')
    if (authError) return authError

    try {
        const body = await request.json()
        const settings = await prisma.siteSettings.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', siteUrl: body.siteUrl || 'http://localhost:3000', ...body },
            update: body,
        })
        return apiSuccess(settings, 'Settings updated')
    } catch { return apiError('Failed to update settings', 500) }
}
