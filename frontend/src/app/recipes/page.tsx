import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Clock, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = { title: 'All Recipes' }

export default async function RecipesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; category?: string; q?: string; difficulty?: string }>
}) {
    const sp = await searchParams
    const page = Math.max(1, parseInt(sp.page || '1'))
    const LIMIT = 12
    const skip = (page - 1) * LIMIT

    const where = {
        status: 'PUBLISHED' as const,
        deletedAt: null,
        ...(sp.category && { category: { slug: sp.category } }),
        ...(sp.difficulty && { difficulty: sp.difficulty as 'EASY' | 'MEDIUM' | 'HARD' }),
        ...(sp.q && {
            OR: [
                { title: { contains: sp.q, mode: 'insensitive' as const } },
                { description: { contains: sp.q, mode: 'insensitive' as const } },
            ],
        }),
    }

    const [total, recipes, categories] = await Promise.all([
        prisma.recipe.count({ where }),
        prisma.recipe.findMany({
            where,
            skip,
            take: LIMIT,
            orderBy: { publishedAt: 'desc' },
            select: {
                id: true,
                slug: true,
                title: true,
                featuredImage: true,
                prepTime: true,
                cookTime: true,
                difficulty: true,
                category: { select: { slug: true, name: true } },
                feedback: {
                    where: { status: 'APPROVED' },
                    select: { rating: true },
                },
            },
        }),
        prisma.category.findMany({ orderBy: { order: 'asc' }, select: { slug: true, name: true } }),
    ])

    const pages = Math.ceil(total / LIMIT)

    return (
        <div className="min-h-screen bg-cream">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">All Recipes</h1>

                {/* Filters */}
                <form className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 sm:mb-8">
                    <input name="q" defaultValue={sp.q} placeholder="Search recipes…"
                        className="flex-1 min-w-0 sm:min-w-[180px] px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    <div className="flex gap-3 flex-wrap">
                        <select name="category" defaultValue={sp.category || ''}
                            className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-200 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                        </select>
                        <select name="difficulty" defaultValue={sp.difficulty || ''}
                            className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-200 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                            <option value="">Any Difficulty</option>
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                        <button type="submit"
                            className="px-5 py-2.5 bg-brand-500 text-white rounded-full text-sm font-semibold hover:bg-brand-600 transition-colors">
                            Filter
                        </button>
                    </div>
                </form>

                <p className="text-sm text-gray-400 mb-4">{total} recipes found</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {recipes.map((recipe) => {
                        const avgRating = recipe.feedback.length > 0
                            ? recipe.feedback.reduce((s, f) => s + f.rating, 0) / recipe.feedback.length
                            : null
                        return (
                            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="aspect-video bg-brand-100 relative overflow-hidden">
                                    {recipe.featuredImage
                                        ? <Image src={recipe.featuredImage} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                        : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                    }
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-brand-600 font-medium mb-1">{recipe.category.name}</p>
                                    <h3 className="font-display font-bold text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-1 mb-2">
                                        {recipe.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />{recipe.prepTime + recipe.cookTime}m
                                        </span>
                                        {avgRating && (
                                            <span className="flex items-center gap-1 ml-auto">
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />{avgRating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8 sm:mt-10 flex-wrap">
                        {page > 1 && (
                            <Link href={`?page=${page - 1}`}
                                className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50">← Prev</Link>
                        )}
                        <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {pages}</span>
                        {page < pages && (
                            <Link href={`?page=${page + 1}`}
                                className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50">Next →</Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
