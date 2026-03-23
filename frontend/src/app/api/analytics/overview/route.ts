import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiSuccess, apiError } from '@/lib/api-auth'

// GET /api/analytics/overview — Admin dashboard stats
export async function GET(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'VIEWER')
    if (authError) return authError

    try {
        const [
            totalRecipes, publishedRecipes, draftRecipes,
            totalCategories, totalChefs,
            pendingFeedback, totalFeedback,
            totalSubscribers, activeSubscribers,
            topRecipes,
            recentFeedback,
        ] = await Promise.all([
            prisma.recipe.count({ where: { deletedAt: null } }),
            prisma.recipe.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
            prisma.recipe.count({ where: { status: 'DRAFT', deletedAt: null } }),
            prisma.category.count(),
            prisma.chef.count(),
            prisma.feedback.count({ where: { status: 'PENDING' } }),
            prisma.feedback.count(),
            prisma.newsletter.count(),
            prisma.newsletter.count({ where: { status: 'ACTIVE' } }),
            prisma.recipe.findMany({
                where: { status: 'PUBLISHED', deletedAt: null },
                orderBy: { viewCount: 'desc' },
                take: 10,
                select: { slug: true, title: true, viewCount: true, featuredImage: true, category: { select: { name: true } } },
            }),
            prisma.feedback.findMany({
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { recipe: { select: { slug: true, title: true } } },
            }),
        ])

        return apiSuccess({
            recipes: { total: totalRecipes, published: publishedRecipes, draft: draftRecipes },
            categories: totalCategories,
            chefs: totalChefs,
            feedback: { pending: pendingFeedback, total: totalFeedback },
            newsletter: { total: totalSubscribers, active: activeSubscribers },
            topRecipes,
            recentFeedback,
        })
    } catch (err) {
        console.error(err)
        return apiError('Failed to fetch analytics', 500)
    }
}
