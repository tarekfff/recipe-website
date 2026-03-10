import { filterRecipes, mockCategories } from '@/lib/mock-data'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Clock, ChefHat, Star } from 'lucide-react'
import { notFound } from 'next/navigation'
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

    const { recipes, total, pages } = filterRecipes({
        category: sp.category,
        difficulty: sp.difficulty,
        q: sp.q,
        page,
        limit: LIMIT,
    })
    const categories = mockCategories

    return (
        <div className="min-h-screen bg-cream">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-10">
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">All Recipes</h1>

                {/* Filters */}
                <form className="flex flex-wrap gap-3 mb-8">
                    <input name="q" defaultValue={sp.q} placeholder="Search recipes…"
                        className="flex-1 min-w-[180px] px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    <select name="category" defaultValue={sp.category || ''}
                        className="px-3 py-2 border border-gray-200 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                    <select name="difficulty" defaultValue={sp.difficulty || ''}
                        className="px-3 py-2 border border-gray-200 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                        <option value="">Any Difficulty</option>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                    <button type="submit"
                        className="px-5 py-2 bg-brand-500 text-white rounded-full text-sm font-semibold hover:bg-brand-600 transition-colors">
                        Filter
                    </button>
                </form>

                <p className="text-sm text-gray-400 mb-4">{total} recipes found</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {recipes.map((recipe) => {
                        const avgRating = recipe.feedback.length > 0
                            ? recipe.feedback.reduce((s: number, f: any) => s + f.rating, 0) / recipe.feedback.length
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
                    <div className="flex justify-center gap-2 mt-10">
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
