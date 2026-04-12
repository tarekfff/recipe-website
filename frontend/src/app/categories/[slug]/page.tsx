import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import { Clock, Star, ArrowLeft } from 'lucide-react'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const cat = await prisma.category.findUnique({ where: { slug } })
    if (!cat) return { title: 'Category Not Found' }

    const siteUrl = process.env.DOMAIN_NAME || 'https://nour-gourmand.com'
    const title = `${cat.name} Recipes — NOIR GOURMAND`
    const description = cat.description || `Browse the best curated collection of ${cat.name} recipes.`
    const imageUrl = cat.image ? (cat.image.startsWith('http') ? cat.image : `${siteUrl}${cat.image}`) : `${siteUrl}/logo.png`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${siteUrl}/categories/${slug}`,
            images: [{ url: imageUrl, width: 1200, height: 630, alt: cat.name }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    }
}

export default async function CategoryDetailPage({ params }: Props) {
    const { slug } = await params

    const category = await prisma.category.findUnique({
        where: { slug },
        include: {
            recipes: {
                where: { status: 'PUBLISHED', deletedAt: null },
                orderBy: { viewCount: 'desc' },
                include: {
                    chef: { select: { name: true, slug: true } },
                    feedback: {
                        where: { status: 'APPROVED' },
                        select: { rating: true },
                    },
                },
            },
        },
    })

    if (!category) notFound()

    return (
        <div className="min-h-screen bg-cream">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                {/* Category header */}
                <div className="mb-6 sm:mb-8">
                    <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 mb-3 sm:mb-4">
                        <ArrowLeft className="w-3.5 h-3.5" /> All Categories
                    </Link>
                    <div className="flex items-start gap-3 sm:gap-4">
                        {category.image && (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
                                <Image src={category.image} alt={category.name} width={64} height={64} className="object-cover w-full h-full" />
                            </div>
                        )}
                        <div>
                            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">{category.name}</h1>
                            {category.nameAr && <p className="text-gray-400 text-sm mt-1" dir="rtl">{category.nameAr}</p>}
                            {category.description && <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{category.description}</p>}
                            <p className="text-sm text-gray-400 mt-1">{category.recipes.length} recipes</p>
                        </div>
                    </div>
                </div>

                {/* Recipes grid */}
                {category.recipes.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 text-gray-400">
                        <p>No recipes in this category yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                        {category.recipes.map((recipe) => {
                            const avgRating = recipe.feedback.length > 0
                                ? recipe.feedback.reduce((s, f) => s + f.rating, 0) / recipe.feedback.length
                                : null
                            return (
                                <Link key={recipe.slug} href={`/recipes/${recipe.slug}`}
                                    className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                                    <div className="aspect-video bg-brand-50 relative overflow-hidden">
                                        {recipe.featuredImage
                                            ? <Image src={recipe.featuredImage} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                            : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                        }
                                    </div>
                                    <div className="p-3 sm:p-4">
                                        <h3 className="font-display font-bold text-sm sm:text-base text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-1 mb-1">
                                            {recipe.title}
                                        </h3>
                                        {recipe.chef && <p className="text-xs text-gray-400 mb-1.5 sm:mb-2">by {recipe.chef.name}</p>}
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
                )}
            </main>
        </div>
    )
}
