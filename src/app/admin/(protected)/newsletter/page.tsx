import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Mail, Users, TrendingUp, Send, Trash2 } from 'lucide-react'
import { NewsletterActions } from './NewsletterActions'

export const metadata: Metadata = { title: 'Newsletter' }
export const dynamic = 'force-dynamic'

export default async function NewsletterPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>
}) {
    const sp = await searchParams
    const page = Math.max(1, parseInt(sp.page || '1'))
    const LIMIT = 20

    const where = sp.status
        ? { status: sp.status as 'ACTIVE' | 'UNSUBSCRIBED' }
        : {}

    const [total, active, subscribers] = await Promise.all([
        prisma.newsletter.count({ where }),
        prisma.newsletter.count({ where: { status: 'ACTIVE' } }),
        prisma.newsletter.findMany({
            where,
            orderBy: { subscribedAt: 'desc' },
            skip: (page - 1) * LIMIT,
            take: LIMIT,
        }),
    ])

    const pages = Math.ceil(total / LIMIT)
    const unsubscribed = await prisma.newsletter.count({ where: { status: 'UNSUBSCRIBED' } })

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-gray-900">Newsletter</h1>
                <p className="text-gray-500 text-sm">Manage your newsletter subscribers</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{active}</p>
                            <p className="text-xs text-gray-500">Active subscribers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{unsubscribed}</p>
                            <p className="text-xs text-gray-500">Unsubscribed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-brand-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{active + unsubscribed}</p>
                            <p className="text-xs text-gray-500">Total all-time</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
                {[
                    { label: 'All', value: '' },
                    { label: 'Active', value: 'ACTIVE' },
                    { label: 'Unsubscribed', value: 'UNSUBSCRIBED' },
                ].map(t => (
                    <a key={t.value} href={t.value ? `?status=${t.value}` : '?'}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${(sp.status || '') === t.value
                                ? 'bg-brand-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}>
                        {t.label}
                    </a>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Email</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Name</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Subscribed</th>
                            <th className="px-5 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {subscribers.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-5 py-3 text-sm font-medium text-gray-900">{sub.email}</td>
                                <td className="px-5 py-3 text-sm text-gray-500">{sub.name || '—'}</td>
                                <td className="px-5 py-3">
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sub.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {sub.status === 'ACTIVE' ? '● Active' : '○ Unsubscribed'}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-sm text-gray-400">
                                    {new Date(sub.subscribedAt).toLocaleDateString()}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <NewsletterActions id={sub.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subscribers.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No subscribers found.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {page > 1 && <a href={`?page=${page - 1}`} className="px-4 py-2 border border-gray-200 rounded-full text-sm">← Prev</a>}
                    <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {pages}</span>
                    {page < pages && <a href={`?page=${page + 1}`} className="px-4 py-2 border border-gray-200 rounded-full text-sm">Next →</a>}
                </div>
            )}
        </div>
    )
}
