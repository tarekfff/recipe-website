import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Clock, ChefHat, Star, ArrowRight, Flame, BookOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Recipe Platform — Discover Amazing Recipes',
    description: 'Explore hundreds of carefully crafted recipes from talented chefs around the world.',
}

async function getHomeData() {
    const [featuredRecipes, categories, chefCount] = await Promise.all([
        prisma.recipe.findMany({
            where: { status: 'PUBLISHED', deletedAt: null },
            orderBy: { viewCount: 'desc' },
            take: 6,
            include: {
                category: { select: { name: true, slug: true } },
                chef: { select: { name: true } },
                feedback: { where: { status: 'APPROVED' }, select: { rating: true } },
            },
        }),
        prisma.category.findMany({
            orderBy: { order: 'asc' },
            take: 8,
            include: { _count: { select: { recipes: { where: { status: 'PUBLISHED', deletedAt: null } } } } },
        }),
        prisma.chef.count(),
    ])
    return { featuredRecipes, categories, chefCount }
}

export default async function HomePage() {
    const { featuredRecipes, categories, chefCount } = await getHomeData()

    return (
        <div className="min-h-screen" style={{ background: '#fef9ee', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            <Navbar />

            {/* ── Hero ── */}
            <section className="relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #1a0a00 0%, #3d1a00 50%, #5a2600 100%)', minHeight: '88vh' }}>
                {/* Decorative warm grain overlay */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px',
                }} />

                {/* Decorative circles */}
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ee8520, transparent 70%)' }} />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #ee8520, transparent 70%)' }} />

                <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Left: copy */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
                                style={{ background: 'rgba(238,133,32,0.2)', color: '#ffc87a', border: '1px solid rgba(238,133,32,0.3)' }}>
                                <Flame className="w-3 h-3" /> Handcrafted Recipes
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 text-white"
                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                Where Every Dish
                                <br />
                                Tells a <em className="not-italic" style={{ color: '#ee8520' }}>Story</em>
                            </h1>
                            <p className="text-lg mb-10 leading-relaxed" style={{ color: '#c4a882' }}>
                                Discover hundreds of curated recipes from talented chefs.
                                From soulful weeknight dinners to lavish weekend feasts.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/recipes"
                                    className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all"
                                    style={{ background: '#ee8520', color: 'white', boxShadow: '0 4px 20px rgba(238,133,32,0.5)' }}>
                                    Browse Recipes <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/categories"
                                    className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all"
                                    style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <BookOpen className="w-4 h-4" /> By Category
                                </Link>
                            </div>

                            {/* Stats row */}
                            <div className="flex gap-8 mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                {[
                                    { value: `${featuredRecipes.length}+`, label: 'Recipes' },
                                    { value: `${categories.length}`, label: 'Categories' },
                                    { value: `${chefCount}`, label: 'Chefs' },
                                ].map(stat => (
                                    <div key={stat.label}>
                                        <div className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#ee8520' }}>{stat.value}</div>
                                        <div className="text-sm" style={{ color: '#9a7d58' }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: recipe card preview stack */}
                        {featuredRecipes.length > 0 && (
                            <div className="relative hidden md:block" style={{ height: 440 }}>
                                {/* Background card */}
                                {featuredRecipes[1] && (
                                    <div className="absolute top-8 right-0 w-72 h-72 rounded-3xl overflow-hidden opacity-50"
                                        style={{ transform: 'rotate(6deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                                        {featuredRecipes[1].featuredImage ? (
                                            <Image src={featuredRecipes[1].featuredImage} alt="" fill className="object-cover" />
                                        ) : <div className="w-full h-full bg-amber-900 flex items-center justify-center text-5xl">🍽️</div>}
                                    </div>
                                )}
                                {/* Foreground card */}
                                <div className="absolute top-0 left-0 w-80 h-80 rounded-3xl overflow-hidden"
                                    style={{ transform: 'rotate(-3deg)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
                                    {featuredRecipes[0].featuredImage ? (
                                        <Image src={featuredRecipes[0].featuredImage} alt={featuredRecipes[0].title} fill className="object-cover" />
                                    ) : <div className="w-full h-full bg-amber-800 flex items-center justify-center text-6xl">🍽️</div>}
                                    {/* Card overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#ee8520' }}>{featuredRecipes[0].category.name}</p>
                                        <p className="text-white font-semibold text-sm leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>{featuredRecipes[0].title}</p>
                                    </div>
                                </div>
                                {/* Floating badge */}
                                <div className="absolute bottom-10 right-6 px-4 py-3 rounded-2xl flex items-center gap-2"
                                    style={{ background: '#fef9ee', boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}>
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-semibold text-gray-800">Top Rated</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom wave */}
                <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
                    <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', height: 60, width: '100%' }}>
                        <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#fef9ee" />
                    </svg>
                </div>
            </section>

            {/* ── Categories ── */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#ee8520' }}>Explore</p>
                        <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#1a0a00' }}>Browse by Category</h2>
                    </div>
                    <Link href="/categories" className="flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: '#ee8520' }}>
                        All categories <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {categories.map((cat, i) => (
                        <Link key={cat.slug} href={`/categories/${cat.slug}`}
                            className="group flex flex-col items-center p-4 rounded-2xl text-center transition-all"
                            style={{ background: 'white', border: '1px solid #f0e8d4', animationDelay: `${i * 50}ms` }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all"
                                style={{ background: '#fff3e0', fontSize: 22 }}>
                                🍴
                            </div>
                            <p className="text-xs font-semibold leading-tight" style={{ color: '#3d1a00' }}>{cat.name}</p>
                            <p className="text-xs mt-1" style={{ color: '#b09070' }}>{cat._count.recipes}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Featured Recipes ── */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#ee8520' }}>Handpicked</p>
                        <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#1a0a00' }}>Featured Recipes</h2>
                    </div>
                    <Link href="/recipes" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#ee8520' }}>
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredRecipes.map((recipe, i) => {
                        const avgRating = recipe.feedback.length > 0
                            ? recipe.feedback.reduce((s, f) => s + f.rating, 0) / recipe.feedback.length
                            : null
                        const isLarge = i === 0

                        return (
                            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`}
                                className={`group rounded-3xl overflow-hidden transition-all hover:-translate-y-1 ${isLarge ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                                style={{ background: 'white', border: '1px solid #f0e8d4', boxShadow: '0 2px 16px rgba(26,10,0,0.06)' }}>

                                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: '#fdf0db' }}>
                                    {recipe.featuredImage ? (
                                        <Image src={recipe.featuredImage} alt={recipe.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                                    )}
                                    {/* Category badge */}
                                    <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full"
                                        style={{ background: 'rgba(26,10,0,0.7)', color: '#ffc87a', backdropFilter: 'blur(4px)' }}>
                                        {recipe.category.name}
                                    </span>
                                    {/* Rating badge */}
                                    {avgRating && (
                                        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                                            style={{ background: 'rgba(255,255,255,0.95)', color: '#b94e14' }}>
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            {avgRating.toFixed(1)}
                                        </span>
                                    )}
                                </div>

                                <div className="p-5">
                                    <h3 className="font-bold text-lg leading-snug mb-2 transition-colors group-hover:text-amber-700"
                                        style={{ fontFamily: "'Playfair Display', serif", color: '#1a0a00' }}>
                                        {recipe.title}
                                    </h3>
                                    {recipe.description && (
                                        <p className="text-sm line-clamp-2 mb-4" style={{ color: '#8a7060' }}>{recipe.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid #f0e8d4' }}>
                                        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#8a7060' }}>
                                            <Clock className="w-3.5 h-3.5" />
                                            {recipe.prepTime + recipe.cookTime} min
                                        </span>
                                        {recipe.chef && (
                                            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#8a7060' }}>
                                                <ChefHat className="w-3.5 h-3.5" />
                                                {recipe.chef.name}
                                            </span>
                                        )}
                                        <span className="ml-auto flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                                            style={{ background: '#fff3e0', color: '#b94e14' }}>
                                            View Recipe →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* ── Newsletter ── */}
            <section className="relative overflow-hidden mx-6 mb-16 rounded-3xl"
                style={{ background: 'linear-gradient(135deg, #3d1a00 0%, #ee8520 100%)' }}>
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px',
                }} />
                <div className="relative max-w-xl mx-auto px-8 py-16 text-center">
                    <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: 'rgba(255,200,122,0.8)' }}>Stay Inspired</p>
                    <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Get Weekly Recipes</h2>
                    <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>Handpicked recipes delivered to your inbox every week.</p>
                    <form className="flex gap-2 max-w-sm mx-auto">
                        <input type="email" placeholder="your@email.com"
                            className="flex-1 px-5 py-3 rounded-full text-sm focus:outline-none"
                            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }} />
                        <button type="submit"
                            className="shrink-0 px-6 py-3 rounded-full text-sm font-semibold transition-all"
                            style={{ background: 'white', color: '#b94e14' }}>
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ background: '#1a0a00', color: '#8a6040' }} className="py-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Recipe Platform" width={36} height={36} className="rounded-lg opacity-70" />
                        <span className="text-sm font-semibold" style={{ color: '#c4a882' }}>Recipe Platform</span>
                    </div>
                    <p className="text-xs" style={{ color: '#5a3c20' }}>© {new Date().getFullYear()} Recipe Platform. All rights reserved.</p>
                    <div className="flex gap-6">
                        {[
                            { href: '/recipes', label: 'Recipes' },
                            { href: '/categories', label: 'Categories' },
                            { href: '/chefs', label: 'Chefs' },
                            { href: '/admin/login', label: 'Admin' },
                        ].map(({ href, label }) => (
                            <Link key={href} href={href} className="text-xs transition-colors hover:text-amber-400" style={{ color: '#8a6040' }}>{label}</Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}
