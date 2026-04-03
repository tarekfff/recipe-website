import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PlusCircle, Search, Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { RecipeStatusBadge } from '@/components/admin/StatusBadge'
import { RecipeActions } from './RecipeActions'

export const metadata: Metadata = { title: 'Recipes' }

const ITEMS_PER_PAGE = 20

export default async function RecipesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; category?: string; q?: string }>
}) {
    const sp = await searchParams
    const page = Math.max(1, parseInt(sp.page || '1'))
    const statusFilter = sp.status as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | undefined
    const categoryFilter = sp.category
    const q = sp.q

    const where = {
        deletedAt: null,
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: { slug: categoryFilter } }),
        ...(q && {
            OR: [
                { title: { contains: q, mode: 'insensitive' as const } },
                { titleAr: { contains: q, mode: 'insensitive' as const } },
            ],
        }),
    }

    const [total, recipes, categories] = await Promise.all([
        prisma.recipe.count({ where }),
        prisma.recipe.findMany({
            where,
            skip: (page - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            orderBy: { updatedAt: 'desc' },
            include: {
                category: { select: { name: true, slug: true } },
                chef: { select: { name: true } },
            },
        }),
        prisma.category.findMany({ orderBy: { order: 'asc' }, select: { slug: true, name: true } }),
    ])

    const pages = Math.ceil(total / ITEMS_PER_PAGE)

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">Recipes</h1>
                    <p className="text-gray-500 text-sm">{total} total</p>
                </div>
                <Link href="/admin/recipes/new"
                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    New Recipe
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
                <form className="flex flex-wrap gap-3 w-full">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            name="q" defaultValue={q} placeholder="Search recipes…"
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <select name="status" defaultValue={statusFilter || ''}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                        <option value="">All Status</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                    <select name="category" defaultValue={categoryFilter || ''}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                    </select>
                    <button type="submit"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        Filter
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipe</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {recipes.map((recipe) => (
                            <tr key={recipe.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-brand-100 flex-shrink-0 overflow-hidden">
                                            {recipe.featuredImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={recipe.featuredImage} alt={recipe.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-brand-400 text-xs">📷</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{recipe.title}</p>
                                            {recipe.chef && <p className="text-xs text-gray-400">by {recipe.chef.name}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-gray-600">{recipe.category.name}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <RecipeStatusBadge status={recipe.status} />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Eye className="w-3.5 h-3.5" />
                                        {recipe.viewCount.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link href={`/admin/recipes/${recipe.slug}/edit`}
                                            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit
                                        </Link>
                                        <RecipeActions slug={recipe.slug} title={recipe.title} status={recipe.status} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {recipes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                                    <p className="text-4xl mb-3">🍽️</p>
                                    <p className="font-medium">No recipes found</p>
                                    <Link href="/admin/recipes/new"
                                        className="text-brand-600 text-sm hover:underline mt-2 inline-block">
                                        Create your first recipe →
                                    </Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Page {page} of {pages}</p>
                        <div className="flex gap-2">
                            {page > 1 && (
                                <Link href={`?page=${page - 1}`}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <ChevronLeft className="w-4 h-4" /> Prev
                                </Link>
                            )}
                            {page < pages && (
                                <Link href={`?page=${page + 1}`}
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
