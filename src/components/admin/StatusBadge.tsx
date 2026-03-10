'use client'

type Status = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'

const CONFIG: Record<Status, { label: string; classes: string }> = {
    PUBLISHED: { label: 'Published', classes: 'bg-green-50 text-green-700 border-green-200' },
    DRAFT: { label: 'Draft', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    ARCHIVED: { label: 'Archived', classes: 'bg-gray-100 text-gray-500 border-gray-200' },
}

export function RecipeStatusBadge({ status }: { status: Status }) {
    const { label, classes } = CONFIG[status] ?? CONFIG.DRAFT
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
            {label}
        </span>
    )
}

type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
const FEEDBACK_CONFIG: Record<FeedbackStatus, { label: string; classes: string }> = {
    PENDING: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { label: 'Approved', classes: 'bg-green-50 text-green-700 border-green-200' },
    REJECTED: { label: 'Rejected', classes: 'bg-red-50 text-red-700 border-red-200' },
}

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
    const { label, classes } = FEEDBACK_CONFIG[status]
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
            {label}
        </span>
    )
}
