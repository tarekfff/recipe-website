import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiSuccess, apiError } from '@/lib/api-auth'

// GET /api/recipes/[slug] — Public: single recipe
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const { searchParams } = new URL(request.url)
        const lang = searchParams.get('lang') || 'en'

        const recipe = await prisma.recipe.findUnique({
            where: { slug, deletedAt: null },
            include: {
                category: { include: { seo: true } },
                chef: true,
                tags: true,
                images: { orderBy: { order: 'asc' } },
                seo: true,
                feedback: {
                    where: { status: 'APPROVED' },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        })

        if (!recipe || recipe.status !== 'PUBLISHED') {
            return NextResponse.json({ success: false, error: 'Recipe not found' }, { status: 404 })
        }

        // Increment view count (fire and forget)
        prisma.recipe.update({
            where: { id: recipe.id },
            data: { viewCount: { increment: 1 } },
        }).catch(() => { })

        const avgRating =
            recipe.feedback.length > 0
                ? recipe.feedback.reduce((sum, f) => sum + f.rating, 0) / recipe.feedback.length
                : null

        return apiSuccess({
            ...recipe,
            title: lang === 'ar' && recipe.titleAr ? recipe.titleAr : recipe.title,
            description: lang === 'ar' && recipe.descriptionAr ? recipe.descriptionAr : recipe.description,
            avgRating,
            ratingCount: recipe.feedback.length,
        })
    } catch (err) {
        console.error(err)
        return apiError('Failed to fetch recipe', 500)
    }
}

// PUT /api/recipes/[slug] — Admin: update recipe
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'EDITOR')
    if (authError) return authError

    try {
        const { slug } = await params
        const body = await request.json()

        const existing = await prisma.recipe.findUnique({ where: { slug } })
        if (!existing) return apiError('Recipe not found', 404)

        const { tagNames, seo, ...data } = body

        // Handle tags
        let tagConnect = undefined
        if (tagNames) {
            const { default: slugify } = await import('slugify')
            const tags = await Promise.all(
                (tagNames as string[]).map((name) =>
                    prisma.tag.upsert({
                        where: { slug: slugify(name, { lower: true, strict: true }) },
                        create: { name, slug: slugify(name, { lower: true, strict: true }) },
                        update: {},
                    })
                )
            )
            tagConnect = { set: tags.map((t) => ({ id: t.id })) }
        }

        // If publishing now, set publishedAt
        if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
            data.publishedAt = new Date()
        }

        const updated = await prisma.recipe.update({
            where: { slug },
            data: {
                ...data,
                tags: tagConnect,
                ...(seo && {
                    seo: {
                        upsert: {
                            create: {
                                metaTitle: seo.metaTitle,
                                metaDescription: seo.metaDescription,
                                focusKeyword: seo.focusKeyword,
                            },
                            update: {
                                metaTitle: seo.metaTitle,
                                metaDescription: seo.metaDescription,
                                focusKeyword: seo.focusKeyword,
                            }
                        }
                    }
                })
            },
            include: { category: true, chef: true, tags: true, seo: true },
        })

        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: 'UPDATE',
                resource: 'recipe',
                resourceId: updated.id,
            },
        })

        return apiSuccess(updated, 'Recipe updated')
    } catch (err) {
        console.error(err)
        return apiError('Failed to update recipe', 500)
    }
}

// DELETE /api/recipes/[slug] — Admin: soft delete
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'ADMIN')
    if (authError) return authError

    try {
        const { slug } = await params
        const recipe = await prisma.recipe.findUnique({ where: { slug } })
        if (!recipe) return apiError('Recipe not found', 404)

        await prisma.recipe.update({
            where: { slug },
            data: { deletedAt: new Date(), status: 'ARCHIVED' },
        })

        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: 'DELETE',
                resource: 'recipe',
                resourceId: recipe.id,
            },
        })

        return apiSuccess(null, 'Recipe deleted')
    } catch (err) {
        console.error(err)
        return apiError('Failed to delete recipe', 500)
    }
}
