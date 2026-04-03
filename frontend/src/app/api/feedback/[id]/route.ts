import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiSuccess, apiError } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache'

type Params = { params: Promise<{ id: string }> }

// PUT /api/feedback/[id] — approve or reject (pass action in body)
export async function PUT(request: Request, { params }: Params) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'EDITOR')
    if (authError) return authError

    try {
        const { id } = await params
        const body = await request.json()
        const { action } = body as { action: 'approve' | 'reject' }

        if (!['approve', 'reject'].includes(action)) return apiError('Invalid action')

        const status = action === 'approve' ? 'APPROVED' : 'REJECTED'
        const updated = await prisma.feedback.update({
            where: { id },
            data: { status },
        })
        revalidatePath('/', 'layout')
        return apiSuccess(updated, `Feedback ${status.toLowerCase()}`)
    } catch { return apiError('Failed to update feedback', 500) }
}

// DELETE /api/feedback/[id]
export async function DELETE(request: Request, { params }: Params) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'EDITOR')
    if (authError) return authError

    try {
        const { id } = await params
        await prisma.feedback.delete({ where: { id } })
        revalidatePath('/', 'layout')
        return apiSuccess(null, 'Feedback deleted')
    } catch { return apiError('Failed to delete feedback', 500) }
}
