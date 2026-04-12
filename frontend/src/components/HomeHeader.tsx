'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search, ChevronDown, Clock } from 'lucide-react'
import { useBranding } from '@/components/BrandingProvider'

type Category = {
    id: string
    slug: string
    name: string
    image?: string | null
    recipeCount: number
}

type Recipe = {
    id: string
    slug: string
    title: string
    featuredImage?: string | null
    prepTime: number
    cookTime: number
    difficulty: string
    category: { slug: string; name: string }
    chef?: { name: string } | null
}

const mainLinks = [
    { label: 'Recipes', href: '/recipes', dropdown: true },
    { label: 'Categories', href: '/categories', dropdown: true },
    { label: 'Chefs', href: '/chefs', dropdown: false },
]

const mobileLinks = [
    { label: 'Home', href: '/' },
    { label: 'Recipes', href: '/recipes' },
    { label: 'Categories', href: '/categories' },
    { label: 'Chefs', href: '/chefs' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
]

export default function HomeHeader() {
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [showCatDropdown, setShowCatDropdown] = useState(false)
    const [showRecipeDropdown, setShowRecipeDropdown] = useState(false)
    const [mobileCatOpen, setMobileCatOpen] = useState(false)
    const [mobileRecipeOpen, setMobileRecipeOpen] = useState(false)
    const catTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const recipeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const { siteName, logo, socialLinks } = useBranding()
    const logoSrc = logo || '/logo.png'

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        const onResize = () => { if (window.innerWidth >= 1024) setOpen(false) }
        window.addEventListener('scroll', onScroll)
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onResize)
        }
    }, [])

    // Fetch categories
    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => { if (data.data && Array.isArray(data.data)) setCategories(data.data) })
            .catch(() => { })
    }, [])

    // Fetch latest recipes
    useEffect(() => {
        fetch('/api/recipes?limit=6&sortBy=publishedAt&order=desc')
            .then(res => res.json())
            .then(data => { if (data.data && Array.isArray(data.data)) setRecipes(data.data) })
            .catch(() => { })
    }, [])

    // Desktop hover handlers
    const handleCatMouseEnter = () => {
        if (catTimeoutRef.current) clearTimeout(catTimeoutRef.current)
        setShowCatDropdown(true); setShowRecipeDropdown(false)
    }
    const handleCatMouseLeave = () => {
        catTimeoutRef.current = setTimeout(() => setShowCatDropdown(false), 200)
    }
    const handleRecipeMouseEnter = () => {
        if (recipeTimeoutRef.current) clearTimeout(recipeTimeoutRef.current)
        setShowRecipeDropdown(true); setShowCatDropdown(false)
    }
    const handleRecipeMouseLeave = () => {
        recipeTimeoutRef.current = setTimeout(() => setShowRecipeDropdown(false), 200)
    }

    const difficultyColor: Record<string, string> = {
        EASY: '#22c55e', MEDIUM: '#f59e0b', HARD: '#ef4444',
    }

    return (
        <>
            {/* ── TOP BANNER ── */}
            <div
                className={`w-full relative z-40 border-b transition-all duration-300 ${scrolled ? 'h-0 overflow-hidden py-0 border-none opacity-0' : 'py-2.5 opacity-100'
                    }`}
                style={{
                    background: 'rgba(123,45,59,0.06)',
                    borderColor: 'rgba(123,45,59,0.08)',
                    fontFamily: "'Outfit', system-ui, sans-serif",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: 'var(--rose)' }}>
                        <span>New Recipes Straight To</span>
                        <strong style={{ color: 'var(--burgundy)' }}>YOUR INBOX!</strong>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: 'var(--rose)' }}>
                        <Link href="/" className="hover:text-[#7B2D3B] transition-colors">Home</Link>
                        <Link href="/about" className="hover:text-[#7B2D3B] transition-colors">About</Link>
                        <Link href="/privacy" className="hover:text-[#7B2D3B] transition-colors">Privacy Policy</Link>
                        <Link href="/contact" className="hover:text-[#7B2D3B] transition-colors">Contact</Link>
                        <Link href="/terms" className="hover:text-[#7B2D3B] transition-colors">Terms of Use</Link>
                        <a href={socialLinks?.pinterest || "https://pinterest.com"} target="_blank" rel="noopener noreferrer"
                            className="hover:text-[#bd081c] transition-colors ml-2" aria-label="Pinterest">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.429 2.977 7.429 6.945 0 4.155-2.617 7.509-6.253 7.509-1.221 0-2.368-.636-2.761-1.385l-.752 2.868c-.272 1.037-1.009 2.338-1.503 3.125 1.258.384 2.598.592 3.987.592 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.638 0 12.017 0z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* ── MAIN HEADER ── */}
            <header
                className="w-full sticky top-0 z-30 border-b shadow-sm transition-all duration-300"
                style={{
                    background: 'rgba(250,247,242,0.95)',
                    backdropFilter: 'blur(16px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
                    borderColor: 'rgba(28,25,23,0.06)',
                }}
            >
                <nav className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 transition-all duration-300 ${scrolled ? 'py-2 md:py-3' : 'py-4 md:py-6'
                    }`}>

                    {/* Logo */}
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className={`relative transition-all duration-300 group-hover:scale-105 ${scrolled ? 'w-12 h-12 md:w-14 md:h-14' : 'w-16 h-16 md:w-20 md:h-20'
                                }`}>
                                <Image
                                    src={logoSrc}
                                    alt={`${siteName} Logo`}
                                    fill
                                    className="object-cover rounded-2xl drop-shadow-md"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span
                                    className={`font-display font-black tracking-tight leading-none transition-all duration-300 ${scrolled ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
                                        }`}
                                    style={{ color: 'var(--burgundy)' }}
                                >
                                    {siteName.split(' ')[0]?.toUpperCase() || 'PLATFORM'}
                                </span>
                                <span
                                    className="text-xs md:text-sm font-bold tracking-[0.2em] mt-1 uppercase"
                                    style={{ color: 'var(--rose)' }}
                                >
                                    {siteName.split(' ').slice(1).join(' ')?.toUpperCase() || 'RECIPES'}
                                </span>
                            </div>
                        </Link>

                        {/* Hamburger (mobile) */}
                        <button
                            onClick={() => setOpen(!open)}
                            className="md:hidden p-2.5 rounded-lg transition-colors hover:bg-[rgba(123,45,59,0.06)]"
                            style={{ color: 'var(--ink)' }}
                            aria-label="Toggle menu"
                        >
                            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Navigation + Search (desktop) */}
                    <div className="hidden md:flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">

                        {/* Nav links */}
                        {/* Nav links */}
                        <div className="flex items-center gap-8 text-[15px] font-bold tracking-widest uppercase"
                            style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--slate)' }}>
                            
                            {/* RECIPES DROPOWN */}
                            <div className="relative" onMouseEnter={handleRecipeMouseEnter} onMouseLeave={handleRecipeMouseLeave}>
                                <Link href="/recipes" className="hover:text-[#7B2D3B] transition-colors flex items-center gap-1">
                                    Recipes <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${showRecipeDropdown ? 'rotate-180' : ''}`} />
                                </Link>
                                <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-5 transition-all duration-300 ease-out ${showRecipeDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`} style={{ zIndex: 50 }}>
                                    <div className="bg-white rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.12)] border border-[rgba(28,25,23,0.06)] overflow-hidden" style={{ width: '380px', fontFamily: "'Outfit', system-ui, sans-serif" }}>
                                        <div className="px-5 py-3.5 bg-gradient-to-r from-[#7B2D3B] to-[#5A1F2B] flex items-center justify-between">
                                            <span className="text-white text-xs font-bold tracking-[0.15em] uppercase">Latest Recipes</span>
                                            <Link href="/recipes" className="text-white/70 text-[11px] font-semibold hover:text-white transition-colors normal-case tracking-normal" onClick={() => setShowRecipeDropdown(false)}>View all →</Link>
                                        </div>
                                        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                                            {recipes.length === 0 ? (
                                                <div className="px-5 py-8 text-center text-sm text-[#9c938a]">Loading recipes...</div>
                                            ) : (
                                                <ul className="py-2">
                                                    {recipes.map((recipe) => (
                                                        <li key={recipe.id}>
                                                            <Link href={`/recipes/${recipe.slug}`} className="group/item flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-[#faf5f0]" onClick={() => setShowRecipeDropdown(false)}>
                                                                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#f4f0ea] border border-[#eae6df] group-hover/item:border-[#7B2D3B]/30 transition-colors relative">
                                                                    {recipe.featuredImage ? <Image src={recipe.featuredImage} alt={recipe.title} fill className="object-cover group-hover/item:scale-110 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[14px] font-semibold text-[#2D2727] group-hover/item:text-[#7B2D3B] transition-colors normal-case tracking-normal leading-tight truncate">{recipe.title}</p>
                                                                    <div className="flex items-center gap-3 mt-1.5">
                                                                        <span className="text-[11px] font-medium text-[#9c938a] normal-case tracking-normal flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prepTime + recipe.cookTime} min</span>
                                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ color: difficultyColor[recipe.difficulty] || '#999', background: `${difficultyColor[recipe.difficulty] || '#999'}15` }}>{recipe.difficulty}</span>
                                                                        <span className="text-[11px] font-medium text-[#b09a8a] normal-case tracking-normal">{recipe.category.name}</span>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="border-t border-[#f0ebe3] px-5 py-3">
                                            <Link href="/recipes" className="text-[13px] font-bold text-[#7B2D3B] hover:text-[#5A1F2B] transition-colors normal-case tracking-normal flex items-center justify-center gap-1.5" onClick={() => setShowRecipeDropdown(false)}>Browse All Recipes <span className="text-[10px]">→</span></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CATEGORIES DROPOWN */}
                            <div className="relative" onMouseEnter={handleCatMouseEnter} onMouseLeave={handleCatMouseLeave}>
                                <Link href="/categories" className="hover:text-[#7B2D3B] transition-colors flex items-center gap-1">
                                    Categories <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${showCatDropdown ? 'rotate-180' : ''}`} />
                                </Link>
                                <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-5 transition-all duration-300 ease-out ${showCatDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`} style={{ zIndex: 50 }}>
                                    <div className="bg-white rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.12)] border border-[rgba(28,25,23,0.06)] overflow-hidden" style={{ minWidth: '280px', maxHeight: '420px', fontFamily: "'Outfit', system-ui, sans-serif" }}>
                                        <div className="px-5 py-3.5 bg-gradient-to-r from-[#7B2D3B] to-[#5A1F2B] flex items-center justify-between">
                                            <span className="text-white text-xs font-bold tracking-[0.15em] uppercase">All Categories</span>
                                            <span className="text-white/60 text-[11px] font-semibold">{categories.length}</span>
                                        </div>
                                        <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
                                            {categories.length === 0 ? (
                                                <div className="px-5 py-8 text-center text-sm text-[#9c938a]">Loading categories...</div>
                                            ) : (
                                                <ul className="py-2">
                                                    {categories.map((cat) => (
                                                        <li key={cat.id}>
                                                            <Link href={`/categories/${cat.slug}`} className="group/item flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-[#faf5f0]" onClick={() => setShowCatDropdown(false)}>
                                                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#f4f0ea] flex items-center justify-center border border-[#eae6df] group-hover/item:border-[#7B2D3B]/30 transition-colors relative">
                                                                    {cat.image ? <Image src={cat.image} alt={cat.name} fill className="object-cover" /> : <span className="text-lg">🍽️</span>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[14px] font-semibold text-[#2D2727] group-hover/item:text-[#7B2D3B] transition-colors normal-case tracking-normal leading-tight truncate">{cat.name}</p>
                                                                    <p className="text-[12px] font-medium text-[#9c938a] normal-case tracking-normal mt-0.5">{cat.recipeCount} {cat.recipeCount === 1 ? 'recipe' : 'recipes'}</p>
                                                                </div>
                                                                <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-[#d6cbb9] group-hover/item:text-[#7B2D3B] group-hover/item:translate-x-0.5 transition-all flex-shrink-0" />
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="border-t border-[#f0ebe3] px-5 py-3">
                                            <Link href="/categories" className="text-[13px] font-bold text-[#7B2D3B] hover:text-[#5A1F2B] transition-colors normal-case tracking-normal flex items-center justify-center gap-1.5" onClick={() => setShowCatDropdown(false)}>View All Categories <span className="text-[10px]">→</span></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link href="/chefs" className="hover:text-[#7B2D3B] transition-colors">Chefs</Link>
                        </div>

                        {/* Search bar */}
                        <form action="/search" className="relative group w-full md:w-[320px]">
                            <input
                                type="text"
                                name="q"
                                placeholder="Search recipes..."
                                className="w-full pl-5 pr-12 py-3 rounded-full text-sm font-medium
                                           focus:outline-none transition-all"
                                style={{
                                    border: '2px solid var(--parchment)',
                                    background: 'white',
                                    color: 'var(--ink)',
                                    fontFamily: "'Outfit', sans-serif",
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'var(--burgundy)'
                                    e.target.style.boxShadow = '0 0 0 4px rgba(123,45,59,0.08)'
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = 'var(--parchment)'
                                    e.target.style.boxShadow = 'none'
                                }}
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors"
                                style={{ color: 'var(--burgundy)' }}
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </form>
                    </div>
                </nav>

                {/* Mobile dropdown */}
                <div
                    className={`md:hidden absolute top-full left-0 w-full origin-top transition-all duration-300 ${open ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
                        }`}
                    style={{
                        background: 'rgba(250,247,242,0.98)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(28,25,23,0.06)',
                        boxShadow: '0 20px 40px rgba(28,25,23,0.08)',
                    }}
                >
                    <div className="px-6 py-5 flex flex-col gap-1">
                        {/* Mobile search */}
                        <form action="/search" className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                style={{ color: 'var(--rose)' }} />
                            <input type="text" name="q" placeholder="Search recipes…"
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                                style={{
                                    background: 'white',
                                    border: '1.5px solid var(--parchment)',
                                    color: 'var(--ink)',
                                }}
                            />
                        </form>
                        {/* Home Link */}
                        <Link href="/"
                            onClick={() => setOpen(false)}
                            className="py-3 px-3 text-[14px] font-bold uppercase tracking-wider rounded-lg border-b border-[rgba(28,25,23,0.06)]
                                       transition-colors duration-200 hover:text-[#7B2D3B] hover:bg-[rgba(123,45,59,0.04)]"
                            style={{ color: 'var(--ink)' }}>
                            Home
                        </Link>

                        {/* Recipes Accordion */}
                        <div className="border-b border-[rgba(28,25,23,0.06)]">
                            <button
                                className="flex items-center justify-between w-full px-3 py-4 text-[14px] font-bold text-[#2D2727] uppercase tracking-wider"
                                onClick={() => setMobileRecipeOpen(!mobileRecipeOpen)}
                            >
                                Recipes
                                <ChevronDown className={`w-4 h-4 text-[#9c938a] transition-transform duration-300 ${mobileRecipeOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${mobileRecipeOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-1 pb-3">
                                    {recipes.map((recipe) => (
                                        <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#faf5f0] transition-colors" onClick={() => setOpen(false)}>
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#f4f0ea] relative border border-[#eae6df]">
                                                {recipe.featuredImage ? <Image src={recipe.featuredImage} alt={recipe.title} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center">🍽️</div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-[#2D2727] truncate normal-case tracking-normal">{recipe.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[11px] text-[#9c938a] flex items-center gap-1 normal-case tracking-normal"><Clock className="w-3 h-3" />{recipe.prepTime + recipe.cookTime}m</span>
                                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ color: difficultyColor[recipe.difficulty] || '#999', background: `${difficultyColor[recipe.difficulty] || '#999'}15` }}>{recipe.difficulty}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    <Link href="/recipes" className="block text-center text-[13px] font-bold text-[#7B2D3B] py-3 mt-1 rounded-xl hover:bg-[#f5eced] transition-colors normal-case tracking-normal" onClick={() => setOpen(false)}>
                                        Browse All Recipes →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Categories Accordion */}
                        <div className="border-b border-[rgba(28,25,23,0.06)]">
                            <button
                                className="flex items-center justify-between w-full px-3 py-4 text-[14px] font-bold text-[#2D2727] uppercase tracking-wider"
                                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                            >
                                Categories
                                <ChevronDown className={`w-4 h-4 text-[#9c938a] transition-transform duration-300 ${mobileCatOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${mobileCatOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-1 pb-3 grid grid-cols-2 gap-2">
                                    {categories.map((cat) => (
                                        <Link key={cat.id} href={`/categories/${cat.slug}`} className="flex items-center gap-2.5 px-3 py-3 rounded-xl hover:bg-[#faf5f0] transition-colors" onClick={() => setOpen(false)}>
                                            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#f4f0ea] relative border border-[#eae6df]">
                                                {cat.image ? <Image src={cat.image} alt={cat.name} fill className="object-cover" /> : <span className="w-full h-full flex items-center justify-center text-sm">🍽️</span>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-[#2D2727] truncate normal-case tracking-normal">{cat.name}</p>
                                                <p className="text-[11px] text-[#9c938a] normal-case tracking-normal">{cat.recipeCount}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <div className="px-1 pb-3">
                                    <Link href="/categories" className="block text-center text-[13px] font-bold text-[#7B2D3B] py-3 rounded-xl hover:bg-[#f5eced] transition-colors normal-case tracking-normal" onClick={() => setOpen(false)}>
                                        View All Categories →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Chefs Link */}
                        <Link href="/chefs"
                            onClick={() => setOpen(false)}
                            className="py-3 px-3 text-[14px] font-bold uppercase tracking-wider rounded-lg border-b border-[rgba(28,25,23,0.06)]
                                       transition-colors duration-200 hover:text-[#7B2D3B] hover:bg-[rgba(123,45,59,0.04)]"
                            style={{ color: 'var(--ink)' }}>
                            Chefs
                        </Link>

                        {/* Other Links */}
                        {mobileLinks.slice(4).map(link => (
                            <Link key={link.label} href={link.href}
                                onClick={() => setOpen(false)}
                                className="py-3 px-3 text-[14px] font-bold uppercase tracking-wider rounded-lg
                                           transition-colors duration-200 hover:text-[#7B2D3B] hover:bg-[rgba(123,45,59,0.04)]"
                                style={{ color: 'var(--ink)' }}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>
        </>
    )
}
