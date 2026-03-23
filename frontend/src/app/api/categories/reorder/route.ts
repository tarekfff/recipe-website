import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiSuccess, apiError } from '@/lib/api-auth'

// PUT /api/categories/reorder
export async function PUT(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const { items } = await request.json() as { items: { id: string; order: number }[] }

        await Promise.all(
            items.map(({ id, order }) =>
                prisma.category.update({ where: { id }, data: { order } })
            )
        )

        return apiSuccess(null, 'Order updated')
    } catch { return apiError('Failed to reorder', 500) }
}
