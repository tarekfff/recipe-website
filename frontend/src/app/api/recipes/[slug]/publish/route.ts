import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiSuccess, apiError } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache'

// POST /api/recipes/[slug]/publish — Admin: toggle publish status
export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'EDITOR')
    if (authError) return authError

    try {
        const { slug } = await params
        const recipe = await prisma.recipe.findUnique({ where: { slug } })
        if (!recipe) return apiError('Recipe not found', 404)

        const newStatus = recipe.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
        const updated = await prisma.recipe.update({
            where: { slug },
            data: {
                status: newStatus,
                publishedAt: newStatus === 'PUBLISHED' ? new Date() : recipe.publishedAt,
            },
        })

        if (user!.id !== 'system-admin') {
            await prisma.auditLog.create({
                data: {
                    userId: user!.id,
                    action: 'PUBLISH',
                    resource: 'recipe',
                    resourceId: recipe.id,
                    changes: { status: { from: recipe.status, to: newStatus } },
                },
            })
        }

        revalidatePath('/', 'layout')
        return apiSuccess(updated, `Recipe ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}`)
    } catch (err) {
        console.error(err)
        return apiError('Failed to toggle publish state', 500)
    }
}
