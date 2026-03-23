import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiPaginated, apiSuccess, apiError } from '@/lib/api-auth'

// GET /api/categories — Public list
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const lang = searchParams.get('lang') || 'en'

        const categories = await prisma.category.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { recipes: { where: { status: 'PUBLISHED', deletedAt: null } } } },
            },
        })

        const transformed = categories.map((c) => ({
            ...c,
            name: lang === 'ar' && c.nameAr ? c.nameAr : c.name,
            recipeCount: c._count.recipes,
            _count: undefined,
        }))

        return apiPaginated(transformed, transformed.length, 1, 100)
    } catch (err) {
        console.error(err)
        return apiError('Failed to fetch categories', 500)
    }
}

// POST /api/categories — Admin: create category
export async function POST(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const body = await request.json()
        const { name, nameAr, description, image } = body

        if (!name) return apiError('name is required')

        const { default: slugify } = await import('slugify')
        const baseSlug = slugify(name, { lower: true, strict: true })
        let slug = baseSlug, counter = 1
        while (await prisma.category.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`
        }

        const maxOrder = await prisma.category.aggregate({ _max: { order: true } })
        const order = (maxOrder._max.order ?? 0) + 1

        const category = await prisma.category.create({
            data: { slug, name, nameAr, description, image, order },
        })

        await prisma.auditLog.create({
            data: { userId: user!.id, action: 'CREATE', resource: 'category', resourceId: category.id },
        })

        return apiSuccess(category, 'Category created')
    } catch (err) {
        console.error(err)
        return apiError('Failed to create category', 500)
    }
}
