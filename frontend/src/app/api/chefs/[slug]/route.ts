import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiSuccess, apiError } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache'

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const chef = await prisma.chef.findUnique({
            where: { slug },
            include: {
                recipes: {
                    where: { status: 'PUBLISHED', deletedAt: null },
                    select: { slug: true, title: true, featuredImage: true, prepTime: true, cookTime: true, difficulty: true },
                    take: 20,
                },
                _count: { select: { recipes: true } },
            },
        })
        if (!chef) return apiError('Chef not found', 404)
        return apiSuccess({ ...chef, recipeCount: chef._count.recipes, _count: undefined })
    } catch { return apiError('Server error', 500) }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const { slug } = await params
        const body = await request.json()
        const updated = await prisma.chef.update({
            where: { slug },
            data: { name: body.name, bio: body.bio, avatar: body.avatar, social: body.social },
        })
        revalidatePath('/', 'layout')
        return apiSuccess(updated, 'Chef updated')
    } catch { return apiError('Failed to update', 500) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const { slug } = await params
        await prisma.chef.delete({ where: { slug } })
        revalidatePath('/', 'layout')
        return apiSuccess(null, 'Chef deleted')
    } catch { return apiError('Failed to delete', 500) }
}
