import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { apiPaginated, apiSuccess, apiError } from '@/lib/api-auth'

// GET /api/recipes — Public list (paginated, filterable)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
        const skip = (page - 1) * limit

        const category = searchParams.get('category')
        const chef = searchParams.get('chef')
        const difficulty = searchParams.get('difficulty')
        const q = searchParams.get('q')
        const sortBy = searchParams.get('sortBy') || 'publishedAt'
        const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'
        const lang = searchParams.get('lang') || 'en'

        const where = {
            status: 'PUBLISHED' as const,
            deletedAt: null,
            ...(category && { category: { slug: category } }),
            ...(chef && { chef: { slug: chef } }),
            ...(difficulty && { difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD' }),
            ...(q && {
                OR: [
                    { title: { contains: q, mode: 'insensitive' as const } },
                    { description: { contains: q, mode: 'insensitive' as const } },
                    { titleAr: { contains: q, mode: 'insensitive' as const } },
                ],
            }),
        }

        const [total, recipes] = await Promise.all([
            prisma.recipe.count({ where }),
            prisma.recipe.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: order },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    titleAr: true,
                    description: true,
                    descriptionAr: true,
                    featuredImage: true,
                    prepTime: true,
                    cookTime: true,
                    servings: true,
                    difficulty: true,
                    calories: true,
                    viewCount: true,
                    publishedAt: true,
                    category: { select: { slug: true, name: true, nameAr: true } },
                    chef: { select: { slug: true, name: true, avatar: true } },
                    tags: { select: { slug: true, name: true } },
                    feedback: {
                        where: { status: 'APPROVED' },
                        select: { rating: true },
                    },
                },
            }),
        ])

        const transformed = recipes.map((r) => ({
            ...r,
            title: lang === 'ar' && r.titleAr ? r.titleAr : r.title,
            description: lang === 'ar' && r.descriptionAr ? r.descriptionAr : r.description,
            avgRating:
                r.feedback.length > 0
                    ? r.feedback.reduce((sum, f) => sum + f.rating, 0) / r.feedback.length
                    : null,
            ratingCount: r.feedback.length,
            feedback: undefined,
        }))

        return apiPaginated(transformed, total, page, limit)
    } catch (err) {
        console.error(err)
        return apiError('Failed to fetch recipes', 500)
    }
}

// POST /api/recipes — Admin: create recipe
export async function POST(request: Request) {
    const { verifyAuth, requireRole, apiSuccess, apiError } = await import('@/lib/api-auth')
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'EDITOR')
    if (authError) return authError

    try {
        const body = await request.json()
        const {
            title, titleAr, description, descriptionAr, content, ingredients, instructions,
            prepTime, cookTime, servings, difficulty, calories, featuredImage, videoUrl,
            categoryId, chefId, tagNames, status, seo,
        } = body

        if (!title || !description || !categoryId) {
            return apiError('title, description, and categoryId are required')
        }

        // Auto-generate slug
        const { default: slugify } = await import('slugify')
        const baseSlug = slugify(title, { lower: true, strict: true })
        let slug = baseSlug
        let counter = 1
        while (await prisma.recipe.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`
        }

        // Handle tags
        const tags = tagNames
            ? await Promise.all(
                (tagNames as string[]).map((name) =>
                    prisma.tag.upsert({
                        where: { slug: slugify(name, { lower: true, strict: true }) },
                        create: { name, slug: slugify(name, { lower: true, strict: true }) },
                        update: {},
                    })
                )
            )
            : []

        const recipe = await prisma.recipe.create({
            data: {
                slug,
                title,
                titleAr,
                description,
                descriptionAr,
                content: content || null,
                ingredients: ingredients || [],
                instructions: instructions || [],
                prepTime: parseInt(prepTime) || 0,
                cookTime: parseInt(cookTime) || 0,
                servings: parseInt(servings) || 1,
                difficulty: difficulty || 'EASY',
                calories: calories ? parseInt(calories) : null,
                featuredImage,
                videoUrl,
                categoryId,
                chefId,
                status: status || 'DRAFT',
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                tags: { connect: tags.map((t) => ({ id: t.id })) },
                ...(seo && (seo.metaTitle || seo.metaDescription || seo.focusKeyword) && {
                    seo: {
                        create: {
                            metaTitle: seo.metaTitle,
                            metaDescription: seo.metaDescription,
                            focusKeyword: seo.focusKeyword,
                        }
                    }
                })
            },
            include: {
                category: true,
                chef: true,
                tags: true,
                seo: true,
            },
        })

        // Audit log
        if (user!.id !== 'system-admin') {
            await prisma.auditLog.create({
                data: {
                    userId: user!.id,
                    action: 'CREATE',
                    resource: 'recipe',
                    resourceId: recipe.id,
                },
            })
        }

        revalidatePath('/', 'layout')
        return apiSuccess(recipe, 'Recipe created', undefined)
    } catch (err) {
        console.error(err)
        return apiError('Failed to create recipe', 500)
    }
}
