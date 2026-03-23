import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

import HomeHeader from '@/components/HomeHeader'
import HeroSlider from '@/components/HeroSlider'
import AdSlot from '@/components/AdSlot'
import NewsletterCard from '@/components/NewsletterCard'
import HomeFooter from '@/components/HomeFooter'

export const metadata: Metadata = {
    title: 'Noir Gourmand — Culinary Stories',
    description: 'Discover curated recipes from passionate chefs. Every dish has a story worth savoring.',
}

/* ─── Section Heading ──────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-center gap-6 mb-14">
            <div className="flex-grow h-px bg-[rgba(28,25,23,0.12)]" />
            <h2 className="font-display text-[28px] sm:text-[34px] font-bold uppercase tracking-[0.06em] whitespace-nowrap text-[#1C1917]">
                {children}
            </h2>
            <div className="flex-grow h-px bg-[rgba(28,25,23,0.12)]" />
        </div>
    )
}

/* ─── Categories data ──────────────────────────────────────── */
const cats = [
    { name: 'Dinner Recipes', slug: 'dinner-recipes', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop' },
    { name: 'Comfort Food', slug: 'comfort-food', img: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400&h=400&fit=crop' },
    { name: 'Quick & Easy', slug: 'quick-easy', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop' },
    { name: 'Healthy', slug: 'healthy-recipes', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop' },
    { name: 'Slow Cooker', slug: 'slow-cooker', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop' },
    { name: 'Breakfast', slug: 'breakfast-brunch', img: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=400&fit=crop' },
    { name: 'Appetizers', slug: 'appetizers', img: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=400&fit=crop' },
    { name: 'Desserts', slug: 'desserts', img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop' },
    { name: 'Seasonal', slug: 'seasonal-recipes', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop' },
    { name: 'BBQ & Grill', slug: 'bbq-outdoor', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop' },
]

/* ═══════════════════════════ PAGE ═════════════════════════════ */
export default async function HomePage() {
    const [latestRecipes, trendingRecipes] = await Promise.all([
        prisma.recipe.findMany({
            where: { status: 'PUBLISHED', deletedAt: null },
            orderBy: { publishedAt: 'desc' },
            take: 8,
            select: { id: true, slug: true, title: true, description: true, featuredImage: true },
        }),
        prisma.recipe.findMany({
            where: { status: 'PUBLISHED', deletedAt: null },
            orderBy: { viewCount: 'desc' },
            take: 8,
            select: { id: true, slug: true, title: true, featuredImage: true },
        }),
    ])


    return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917]">

            {/* Block 1 — Header */}
            <HomeHeader />

            {/* Block 2 — Hero Slider */}
            <HeroSlider />

            {/* Block 3 — Ad Slots (×2) */}
            <AdSlot />
            <AdSlot />

            {/* Block 4 — Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <SectionHeading>Browse Categories</SectionHeading>

                {/* Desktop (hidden md:flex) */}
                <div className="hidden md:flex flex-wrap justify-center gap-8 lg:gap-10">
                    {cats.map(c => (
                        <Link key={c.slug} href={`/categories/${c.slug}`}
                            className="group flex flex-col items-center transition-transform duration-300 hover:scale-105"
                            style={{ flexBasis: 'calc(20% - 2rem)', maxWidth: 200 }}>
                            <div className="w-44 h-44 lg:w-48 lg:h-48 rounded-full overflow-hidden mb-4 relative
                                            shadow-lg group-hover:shadow-xl transition-shadow duration-300
                                            border-[3px] border-[#F0EBE3]">
                                <Image src={c.img} alt={c.name} fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <h3 className="font-semibold text-center text-sm text-[#44403C] group-hover:text-[#7B2D3B] transition-colors duration-200">
                                {c.name}
                            </h3>
                        </Link>
                    ))}
                </div>

                {/* Mobile (md:hidden) — separate HTML */}
                <div className="md:hidden grid grid-cols-2 gap-5 justify-items-center">
                    {cats.map(c => (
                        <Link key={c.slug} href={`/categories/${c.slug}`}
                            className="group flex flex-col items-center transition-transform duration-300 hover:scale-105">
                            <div className="w-28 h-28 rounded-full overflow-hidden mb-3 relative shadow-md
                                            border-2 border-[#F0EBE3]">
                                <Image src={c.img} alt={c.name} fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <h3 className="font-semibold text-center text-xs text-[#44403C] group-hover:text-[#7B2D3B] transition-colors">
                                {c.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Block 5 — Ad Slot */}
            <AdSlot />

            {/* Block 6 — Latest Recipes */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <SectionHeading>Latest Recipes</SectionHeading>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                    {latestRecipes.map(recipe => (
                        <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group block">
                            <div className="rounded-[14px] overflow-hidden bg-[#F0EBE3] shadow-[0_2px_12px_rgba(28,25,23,0.06)]
                                            transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(28,25,23,0.1)]">
                                <div className="aspect-[3/4] relative overflow-hidden">
                                    {recipe.featuredImage ? (
                                        <Image src={recipe.featuredImage} alt={recipe.title} fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#F0EBE3]">
                                            <span className="text-5xl opacity-15">🍽️</span>
                                        </div>
                                    )}
                                    {/* Bottom gradient scrim on hover */}
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent
                                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <div className="p-5">
                                    <h3 className="font-display text-lg font-bold leading-snug mb-2 text-[#1C1917]
                                                   group-hover:text-[#7B2D3B] transition-colors duration-200">
                                        {recipe.title}
                                    </h3>
                                    <p className="line-clamp-3 text-[13px] leading-relaxed text-[#44403C]">
                                        {recipe.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center mt-14 gap-2">
                    <span className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#7B2D3B]">1</span>
                    {[2, 3].map(n => (
                        <Link key={n} href={`/recipes?page=${n}`}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-[#44403C]
                                       border-[1.5px] border-[rgba(28,25,23,0.12)]
                                       hover:border-[#7B2D3B] hover:text-[#7B2D3B] transition-colors duration-200">
                            {n}
                        </Link>
                    ))}
                    <span className="px-2 py-2 text-sm text-[#A8727D]">…</span>
                    <Link href="/recipes?page=2"
                        className="px-4 py-2 rounded-lg text-sm font-bold text-[#44403C]
                                   border-[1.5px] border-[rgba(28,25,23,0.12)]
                                   hover:border-[#7B2D3B] hover:text-[#7B2D3B] transition-colors duration-200">
                        →
                    </Link>
                </div>
            </section>

            {/* Block 7 — Ad Slot */}
            <AdSlot />

            {/* Block 8 — Trending */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <SectionHeading>Trending</SectionHeading>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 my-3">
                    {trendingRecipes.map(recipe => (
                        <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group block">
                            <div className="rounded-[14px] overflow-hidden bg-[#F0EBE3] shadow-[0_2px_12px_rgba(28,25,23,0.06)]
                                            transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(28,25,23,0.1)]">
                                <div className="aspect-[3/4] relative overflow-hidden">
                                    {recipe.featuredImage ? (
                                        <Image src={recipe.featuredImage} alt={recipe.title} fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#F0EBE3]">
                                            <span className="text-5xl opacity-15">🍽️</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-display text-[15.36px] font-bold leading-snug text-[#1C1917]
                                                   group-hover:text-[#7B2D3B] transition-colors duration-200">
                                        {recipe.title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Block 9 — Ad Slot */}
            <AdSlot />

            {/* Block 10 — Newsletter */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <NewsletterCard />
            </section>

            {/* Block 11 — Empty Articles + Ad */}
            {/* Latest Articles Section */}
            <AdSlot />

            {/* Block 12 — Footer */}
            <HomeFooter />
        </div>
    )
}
