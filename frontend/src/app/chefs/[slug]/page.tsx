import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import { Clock, Star, ChefHat, ArrowLeft } from 'lucide-react'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const chef = await prisma.chef.findUnique({ where: { slug } })
    if (!chef) return { title: 'Chef Not Found' }
    return { title: `${chef.name} — Recipes`, description: chef.bio || `Recipes by ${chef.name}` }
}

export default async function ChefProfilePage({ params }: Props) {
    const { slug } = await params

    const chef = await prisma.chef.findUnique({
        where: { slug },
        include: {
            recipes: {
                where: { status: 'PUBLISHED', deletedAt: null },
                orderBy: { viewCount: 'desc' },
                include: {
                    category: { select: { name: true, slug: true } },
                    feedback: {
                        where: { status: 'APPROVED' },
                        select: { rating: true },
                    },
                },
            },
        },
    })

    if (!chef) notFound()

    return (
        <div className="min-h-screen bg-cream">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <Link href="/chefs" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 mb-4 sm:mb-6">
                    <ArrowLeft className="w-3.5 h-3.5" /> All Chefs
                </Link>

                {/* Chef hero */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-5 sm:p-8 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-sage-100 flex-shrink-0 flex items-center justify-center">
                        {chef.avatar
                            ? <img src={chef.avatar} alt={chef.name} className="w-full h-full object-cover" />
                            : <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-sage-400" />
                        }
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{chef.name}</h1>
                        <p className="text-gray-400 text-sm mb-2 sm:mb-3">{chef.recipes.length} published recipes</p>
                        {chef.bio && <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{chef.bio}</p>}
                    </div>
                </div>

                {/* Recipes */}
                <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">
                    Recipes by {chef.name}
                </h2>

                {chef.recipes.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 text-gray-400">No published recipes yet.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {chef.recipes.map((recipe) => {
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
                                        <p className="text-xs text-brand-600 font-medium mb-1">
                                            <Link href={`/categories/${recipe.category.slug}`} className="hover:underline">
                                                {recipe.category.name}
                                            </Link>
                                        </p>
                                        <h3 className="font-display font-bold text-sm sm:text-base text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-1 mb-1.5 sm:mb-2">
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
                )}
            </main>
        </div>
    )
}
