import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiSuccess, apiError } from '@/lib/api-auth'

// GET /api/categories/[slug]
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const category = await prisma.category.findUnique({
            where: { slug },
            include: { seo: true, _count: { select: { recipes: true } } },
        })
        if (!category) return apiError('Category not found', 404)
        return apiSuccess({ ...category, recipeCount: category._count.recipes, _count: undefined })
    } catch { return apiError('Server error', 500) }
}

// PUT /api/categories/[slug]
export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const { slug } = await params
        const body = await request.json()
        const updated = await prisma.category.update({
            where: { slug },
            data: {
                name: body.name,
                nameAr: body.nameAr,
                description: body.description,
                image: body.image,
            },
        })
        return apiSuccess(updated, 'Category updated')
    } catch { return apiError('Failed to update category', 500) }
}

// DELETE /api/categories/[slug]
export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const { slug } = await params
        const cat = await prisma.category.findUnique({ where: { slug } })
        if (!cat) return apiError('Not found', 404)
        await prisma.category.delete({ where: { slug } })
        return apiSuccess(null, 'Category deleted')
    } catch { return apiError('Failed to delete category', 500) }
}
