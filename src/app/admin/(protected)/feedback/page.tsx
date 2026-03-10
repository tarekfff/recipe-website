import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { FeedbackStatusBadge } from '@/components/admin/StatusBadge'
import { FeedbackActions } from '@/components/admin/FeedbackActions'

export const metadata: Metadata = { title: 'Feedback' }

export default async function FeedbackPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; rating?: string }>
}) {
    const sp = await searchParams
    const page = Math.max(1, parseInt(sp.page || '1'))
    const LIMIT = 20
    const statusFilter = sp.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined
    const ratingFilter = sp.rating ? parseInt(sp.rating) : undefined

    const where = {
        ...(statusFilter && { status: statusFilter }),
        ...(ratingFilter && { rating: ratingFilter }),
    }

    const [total, feedback] = await Promise.all([
        prisma.feedback.count({ where }),
        prisma.feedback.findMany({
            where,
            skip: (page - 1) * LIMIT,
            take: LIMIT,
            orderBy: { createdAt: 'desc' },
            include: { recipe: { select: { slug: true, title: true } } },
        }),
    ])

    const pages = Math.ceil(total / LIMIT)

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">Feedback</h1>
                    <p className="text-gray-500 text-sm">{total} total reviews</p>
                </div>
            </div>

            {/* Filters */}
            <form className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
                <select name="status" defaultValue={statusFilter || ''}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
                <select name="rating" defaultValue={ratingFilter || ''}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                    <option value="">All Ratings</option>
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} ★</option>)}
                </select>
                <button type="submit"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    Filter
                </button>
            </form>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviewer</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipe</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {feedback.map((f) => (
                            <tr key={f.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-gray-900">{f.name}</p>
                                    {f.email && <p className="text-xs text-gray-400">{f.email}</p>}
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 max-w-xs">{f.comment}</p>
                                </td>
                                <td className="px-4 py-4">
                                    <Link href={`/recipes/${f.recipe.slug}`} target="_blank"
                                        className="text-sm text-brand-600 hover:underline line-clamp-1">
                                        {f.recipe.title}
                                    </Link>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-sm ${i < f.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <FeedbackStatusBadge status={f.status} />
                                </td>
                                <td className="px-4 py-4">
                                    <FeedbackActions id={f.id} status={f.status} />
                                </td>
                            </tr>
                        ))}
                        {feedback.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    No feedback found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Page {page} of {pages}</p>
                        <div className="flex gap-2">
                            {page > 1 && (
                                <Link href={`?page=${page - 1}&status=${statusFilter || ''}`}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <ChevronLeft className="w-4 h-4" /> Prev
                                </Link>
                            )}
                            {page < pages && (
                                <Link href={`?page=${page + 1}&status=${statusFilter || ''}`}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                                    Next <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
