import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Clock, Star, SearchX } from 'lucide-react'
import Navbar from '@/components/Navbar'
import HomeFooter from '@/components/HomeFooter'

export const metadata: Metadata = { title: 'Search Results' }

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>
}) {
    const sp = await searchParams
    const query = sp.q || ''
    const page = Math.max(1, parseInt(sp.page || '1'))
    const LIMIT = 12
    const skip = (page - 1) * LIMIT

    const where = {
        status: 'PUBLISHED' as const,
        deletedAt: null,
        ...(query && {
            OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { description: { contains: query, mode: 'insensitive' as const } },
                { tags: { some: { name: { contains: query, mode: 'insensitive' as const } } } }
            ],
        }),
    }

    const [total, recipes] = await Promise.all([
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
        })
    ])

    const pages = Math.ceil(total / LIMIT)

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fdfbfb' }}>
            <Navbar />

            <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-12 md:py-16">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#2a1400', fontFamily: "'Playfair Display', serif" }}>
                        Search Results
                    </h1>
                    <div className="flex items-center gap-2">
                        <p className="text-[#8c6b65] font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {total} result{total !== 1 ? 's' : ''} found for
                        </p>
                        {query && (
                            <span className="px-3 py-1 bg-[#f4dbd4] text-[#8c4343] rounded-full text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                &quot;{query}&quot;
                            </span>
                        )}
                    </div>
                </div>

                {recipes.length === 0 ? (
                    <div className="text-center py-24 bg-white border border-[#f4dbd4] rounded-2xl flex flex-col items-center justify-center">
                        <SearchX className="w-16 h-16 text-[#e6d0ca] mb-4" />
                        <h2 className="text-2xl font-bold text-[#4a3520] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No recipes found</h2>
                        <p className="text-[#8c6b65]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>We couldn&apos;t find any recipes matching your search. Try different keywords.</p>
                        <Link href="/categories" className="mt-6 px-6 py-3 bg-[#b55c5c] text-white rounded-full font-bold hover:bg-[#8c4343] transition-colors shadow-lg shadow-[#b55c5c]/20">
                            Browse Categories
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                            {recipes.map((recipe) => {
                                const avgRating = recipe.feedback.length > 0
                                    ? recipe.feedback.reduce((s, f) => s + f.rating, 0) / recipe.feedback.length
                                    : null

                                return (
                                    <Link key={recipe.slug} href={`/recipes/${recipe.slug}`}
                                        className="group bg-white rounded-2xl overflow-hidden border border-[#f4dbd4] shadow-sm hover:shadow-xl hover:shadow-[#f4dbd4]/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                                        
                                        <div className="aspect-[4/3] bg-[#fcedea] relative overflow-hidden">
                                            {recipe.featuredImage ? (
                                                <Image src={recipe.featuredImage} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-50">🍽️</div>
                                            )}
                                            
                                            {/* Category Badge */}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#8c4343] text-[10px] font-black tracking-wider uppercase rounded-full shadow-sm">
                                                    {recipe.category.name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-lg leading-snug group-hover:text-[#b55c5c] transition-colors mb-4 line-clamp-2" style={{ color: '#2a1400', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                                {recipe.title}
                                            </h3>
                                            
                                            <div className="mt-auto pt-4 border-t border-[#f4dbd4]/50 flex items-center justify-between text-xs font-semibold" style={{ color: '#8c6b65', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-[#b55c5c]" />
                                                    <span>{recipe.prepTime + recipe.cookTime} MIN</span>
                                                </div>
                                                
                                                {avgRating && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
                                                        <span>{avgRating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-16" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {page > 1 && (
                                    <Link href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                                        className="px-5 py-2.5 bg-white border border-[#e6d0ca] text-[#8c6b65] rounded-full font-bold text-sm tracking-wide hover:border-[#b55c5c] hover:text-[#b55c5c] transition-colors shadow-sm">
                                        Previous
                                    </Link>
                                )}
                                <span className="px-4 py-2 text-sm font-bold text-[#4a3520]">
                                    {page} / {pages}
                                </span>
                                {page < pages && (
                                    <Link href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                                        className="px-5 py-2.5 bg-white border border-[#e6d0ca] text-[#8c6b65] rounded-full font-bold text-sm tracking-wide hover:border-[#b55c5c] hover:text-[#b55c5c] transition-colors shadow-sm">
                                        Next
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            <HomeFooter />
        </div>
    )
}
