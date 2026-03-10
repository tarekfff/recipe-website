import type { Metadata } from 'next'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
    UtensilsCrossed, FolderOpen, ChefHat, MessageSquare,
    Mail, Eye, TrendingUp, Clock, PlusCircle
} from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

async function getDashboardData() {
    const [
        totalRecipes, publishedRecipes,
        totalCategories, totalChefs,
        pendingFeedback, totalSubscribers,
        topRecipes, recentFeedback,
    ] = await Promise.all([
        prisma.recipe.count({ where: { deletedAt: null } }),
        prisma.recipe.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
        prisma.category.count(),
        prisma.chef.count(),
        prisma.feedback.count({ where: { status: 'PENDING' } }),
        prisma.newsletter.count({ where: { status: 'ACTIVE' } }),
        prisma.recipe.findMany({
            where: { status: 'PUBLISHED', deletedAt: null },
            orderBy: { viewCount: 'desc' },
            take: 5,
            select: { slug: true, title: true, viewCount: true, category: { select: { name: true } } },
        }),
        prisma.feedback.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { recipe: { select: { slug: true, title: true } } },
        }),
    ])

    return {
        stats: { totalRecipes, publishedRecipes, totalCategories, totalChefs, pendingFeedback, totalSubscribers },
        topRecipes, recentFeedback,
    }
}

function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType
    label: string
    value: number | string
    sub?: string
    color: string
}) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('700', '100')}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
        </div>
    )
}

export default async function DashboardPage() {
    const { stats, topRecipes, recentFeedback } = await getDashboardData()

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back — here's your platform overview</p>
                </div>
                <Link href="/admin/recipes/new"
                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    New Recipe
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <StatCard icon={UtensilsCrossed} label="Total Recipes" value={stats.totalRecipes}
                    sub={`${stats.publishedRecipes} published`} color="text-brand-700" />
                <StatCard icon={FolderOpen} label="Categories" value={stats.totalCategories} color="text-sage-700" />
                <StatCard icon={ChefHat} label="Chefs" value={stats.totalChefs} color="text-blue-700" />
                <StatCard icon={MessageSquare} label="Pending Reviews" value={stats.pendingFeedback}
                    sub="awaiting approval" color="text-amber-700" />
                <StatCard icon={Mail} label="Subscribers" value={stats.totalSubscribers}
                    sub="active" color="text-purple-700" />
                <StatCard icon={Eye} label="Published" value={stats.publishedRecipes}
                    sub="live recipes" color="text-green-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Recipes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-brand-500" />
                            Top Recipes
                        </h2>
                        <Link href="/admin/recipes" className="text-xs text-brand-600 hover:underline">View all</Link>
                    </div>
                    <div className="space-y-3">
                        {topRecipes.map((r, i) => (
                            <div key={r.slug} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-300 w-5">#{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/admin/recipes/${r.slug}/edit`}
                                        className="text-sm font-medium text-gray-800 hover:text-brand-600 truncate block">
                                        {r.title}
                                    </Link>
                                    <p className="text-xs text-gray-400">{r.category.name}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Eye className="w-3 h-3" />
                                    {r.viewCount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {topRecipes.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No published recipes yet</p>
                        )}
                    </div>
                </div>

                {/* Pending Feedback */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            Pending Feedback
                        </h2>
                        <Link href="/admin/feedback" className="text-xs text-brand-600 hover:underline">Manage</Link>
                    </div>
                    <div className="space-y-3">
                        {recentFeedback.map((f) => (
                            <div key={f.id} className="border-b border-gray-50 pb-3 last:border-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800">{f.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{f.recipe.title}</p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{f.comment}</p>
                                    </div>
                                    <div className="flex items-center gap-0.5 flex-shrink-0">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-xs ${i < f.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recentFeedback.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No pending feedback 🎉</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
