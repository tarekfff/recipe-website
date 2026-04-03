import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiPaginated, apiSuccess, apiError } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
        const [total, chefs] = await Promise.all([
            prisma.chef.count(),
            prisma.chef.findMany({
                skip: (page - 1) * limit, take: limit,
                include: { _count: { select: { recipes: true } } },
                orderBy: { name: 'asc' },
            }),
        ])
        return apiPaginated(chefs.map(c => ({ ...c, recipeCount: c._count.recipes, _count: undefined })), total, page, limit)
    } catch { return apiError('Server error', 500) }
}

export async function POST(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const body = await request.json()
        const { name, bio, avatar, social } = body
        if (!name) return apiError('name is required')

        const { default: slugify } = await import('slugify')
        const baseSlug = slugify(name, { lower: true, strict: true })
        let slug = baseSlug, counter = 1
        while (await prisma.chef.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`
        }

        const chef = await prisma.chef.create({ data: { slug, name, bio, avatar, social } })
        revalidatePath('/', 'layout')
        return apiSuccess(chef, 'Chef created')
    } catch { return apiError('Failed to create chef', 500) }
}
