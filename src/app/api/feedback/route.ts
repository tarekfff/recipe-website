import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiPaginated, apiSuccess, apiError } from '@/lib/api-auth'
import { z } from 'zod'

const feedbackSchema = z.object({
    recipeId: z.string(),
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal('')),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(5).max(1000),
})

// POST /api/feedback — Public: submit feedback
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const data = feedbackSchema.parse(body)

        const recipe = await prisma.recipe.findUnique({
            where: { id: data.recipeId, status: 'PUBLISHED', deletedAt: null },
        })
        if (!recipe) return apiError('Recipe not found', 404)

        const feedback = await prisma.feedback.create({
            data: {
                recipeId: data.recipeId,
                name: data.name,
                email: data.email || null,
                rating: data.rating,
                comment: data.comment,
                status: 'PENDING',
            },
        })

        return apiSuccess(feedback, 'Feedback submitted and awaiting review')
    } catch (err) {
        if (err instanceof z.ZodError) return apiError(err.errors[0].message)
        return apiError('Failed to submit feedback', 500)
    }
}

// GET /api/feedback — Admin: list all feedback
export async function GET(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'EDITOR')
    if (authError) return authError

    try {
        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
        const status = searchParams.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null
        const rating = searchParams.get('rating')

        const where = {
            ...(status && { status }),
            ...(rating && { rating: parseInt(rating) }),
        }

        const [total, feedback] = await Promise.all([
            prisma.feedback.count({ where }),
            prisma.feedback.findMany({
                where, skip: (page - 1) * limit, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { recipe: { select: { slug: true, title: true } } },
            }),
        ])

        return apiPaginated(feedback, total, page, limit)
    } catch { return apiError('Server error', 500) }
}
