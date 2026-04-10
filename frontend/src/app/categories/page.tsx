import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { FolderOpen, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
    title: 'Recipe Categories',
    description: 'Browse all recipe categories — from quick weeknight meals to indulgent desserts.',
}

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
        include: {
            _count: { select: { recipes: { where: { status: 'PUBLISHED', deletedAt: null } } } },
        },
    })

    return (
        <div className="min-h-screen bg-cream">
            {/* Nav */}
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Hero */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Browse Categories</h1>
                    <p className="text-gray-500 text-base sm:text-lg">{categories.length} categories to explore</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {categories.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/categories/${cat.slug}`}
                            className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"
                        >
                            <div className="aspect-video bg-gradient-to-br from-brand-50 to-brand-100 relative overflow-hidden">
                                {cat.image ? (
                                    <Image
                                        src={cat.image}
                                        alt={cat.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-brand-300" />
                                    </div>
                                )}
                            </div>
                            <div className="p-3 sm:p-4">
                                <h2 className="font-display font-bold text-sm sm:text-base text-gray-900 group-hover:text-brand-700 transition-colors leading-snug">
                                    {cat.name}
                                </h2>
                                {cat.nameAr && (
                                    <p className="text-xs text-gray-400 mt-0.5" dir="rtl">{cat.nameAr}</p>
                                )}
                                <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                                    <span className="text-[11px] sm:text-xs text-gray-400">{cat._count.recipes} recipes</span>
                                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-16 sm:py-20 text-gray-400">
                        <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No categories yet.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
