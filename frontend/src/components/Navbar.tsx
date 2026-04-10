'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronDown, Clock, Menu, X } from 'lucide-react'
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

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [showCatDropdown, setShowCatDropdown] = useState(false)
    const [showRecipeDropdown, setShowRecipeDropdown] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mobileCatOpen, setMobileCatOpen] = useState(false)
    const [mobileRecipeOpen, setMobileRecipeOpen] = useState(false)
    const catTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const recipeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const { siteName, logo, socialLinks } = useBranding()

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileMenuOpen])

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

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
        setMobileCatOpen(false)
        setMobileRecipeOpen(false)
    }

    const logoSrc = logo || '/logo.png'

    const difficultyColor: Record<string, string> = {
        EASY: '#22c55e', MEDIUM: '#f59e0b', HARD: '#ef4444',
    }

    return (
        <>
            {/* ── TOP BANNER ── */}
            <div className={`w-full bg-[#fcedea] text-[#8c6b65] text-xs font-semibold uppercase tracking-widest relative z-40 border-b border-[#f4dbd4] transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden py-0 border-none opacity-0' : 'py-2.5 opacity-100'}`}
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline">New Recipes Straight To</span>
                        <span className="sm:hidden">Recipes To</span>
                        <strong className="text-[#65433d] font-bold">YOUR INBOX!</strong>
                    </div>
                    <div className="hidden lg:flex items-center gap-6">
                        <Link href="/" className="hover:text-[#65433d] transition-colors">Home</Link>
                        <Link href="/about" className="hover:text-[#65433d] transition-colors">About</Link>
                        <Link href="/privacy" className="hover:text-[#65433d] transition-colors">Privacy Policy</Link>
                        <Link href="/contact" className="hover:text-[#65433d] transition-colors">Contact</Link>
                        <Link href="/terms" className="hover:text-[#65433d] transition-colors">Terms of Use</Link>
                        <a href={socialLinks?.pinterest || "https://pinterest.com"} target="_blank" rel="noopener noreferrer" className="hover:text-[#bd081c] transition-colors ml-2" aria-label="Pinterest">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.429 2.977 7.429 6.945 0 4.155-2.617 7.509-6.253 7.509-1.221 0-2.368-.636-2.761-1.385l-.752 2.868c-.272 1.037-1.009 2.338-1.503 3.125 1.258.384 2.598.592 3.987.592 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.638 0 12.017 0z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* ── MAIN HEADER ── */}
            <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#f4dbd4] sticky top-0 z-30 shadow-sm transition-all duration-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                <nav className={`max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3 sm:py-4 md:py-6'}`}>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 sm:gap-4 group flex-shrink-0">
                        <div className={`relative transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14' : 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20'}`}>
                            <Image src={logoSrc} alt={`${siteName} Logo`} fill className="object-cover rounded-xl sm:rounded-2xl drop-shadow-md" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className={`font-black tracking-tight leading-none transition-all duration-300 ${isScrolled ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'}`} style={{ color: '#2a1400' }}>
                                {siteName.split(' ')[0]?.toUpperCase() || 'PLATFORM'}
                            </span>
                            <span className="text-[10px] sm:text-xs md:text-sm text-[#b55c5c] font-bold tracking-[0.15em] sm:tracking-[0.2em] mt-0.5 sm:mt-1 uppercase" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {siteName.split(' ').slice(1).join(' ')?.toUpperCase() || 'RECIPES'}
                            </span>
                        </div>
                    </Link>

                    {/* ═══ DESKTOP NAV (hidden on mobile) ═══ */}
                    <div className="hidden md:flex items-center gap-8 flex-shrink-0">
                        <div className="flex items-center gap-8 text-[15px] font-bold tracking-widest uppercase" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a3520' }}>

                            {/* RECIPES DESKTOP DROPDOWN */}
                            <div className="relative" onMouseEnter={handleRecipeMouseEnter} onMouseLeave={handleRecipeMouseLeave}>
                                <Link href="/recipes" className="hover:text-[#b55c5c] transition-colors flex items-center gap-1">
                                    Recipes <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${showRecipeDropdown ? 'rotate-180' : ''}`} />
                                </Link>
                                <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ease-out ${showRecipeDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`} style={{ zIndex: 50 }}>
                                    <div className="bg-white rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.12)] border border-[#f0ebe3] overflow-hidden" style={{ width: '380px', fontFamily: "'Poppins', system-ui, sans-serif" }}>
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

                            {/* CATEGORIES DESKTOP DROPDOWN */}
                            <div className="relative" onMouseEnter={handleCatMouseEnter} onMouseLeave={handleCatMouseLeave}>
                                <Link href="/categories" className="hover:text-[#b55c5c] transition-colors flex items-center gap-1">
                                    Categories <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${showCatDropdown ? 'rotate-180' : ''}`} />
                                </Link>
                                <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ease-out ${showCatDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`} style={{ zIndex: 50 }}>
                                    <div className="bg-white rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.12)] border border-[#f0ebe3] overflow-hidden" style={{ minWidth: '280px', maxHeight: '420px', fontFamily: "'Poppins', system-ui, sans-serif" }}>
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

                            <Link href="/chefs" className="hover:text-[#b55c5c] transition-colors">Chefs</Link>
                        </div>

                        {/* Desktop Search */}
                        <form action="/search" className="relative w-[280px] lg:w-[320px]">
                            <input type="text" name="q" placeholder="Search recipes..." className="w-full pl-5 pr-12 py-3 rounded-full border-2 border-[#e6d0ca] bg-white text-[#4a3520] placeholder:text-[#b39e99] focus:outline-none focus:border-[#b55c5c] focus:ring-4 focus:ring-[#b55c5c]/10 transition-all font-medium text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#b55c5c] hover:text-[#8c4343] transition-colors" aria-label="Search">
                                <Search className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </form>
                    </div>

                    {/* ═══ MOBILE HAMBURGER BUTTON ═══ */}
                    <button
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[#e6d0ca] bg-white text-[#4a3520] hover:bg-[#faf5f0] transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </nav>
            </header>

            {/* ═══ MOBILE MENU OVERLAY ═══ */}
            <div
                className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible'}`}
            >
                {/* Backdrop */}
                <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeMobileMenu} />

                {/* Slide-in Panel */}
                <div
                    className={`absolute top-0 right-0 h-full w-[85%] max-w-[380px] bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
                >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ebe3] sticky top-0 bg-white z-10">
                        <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
                            <div className="relative w-10 h-10">
                                <Image src={logoSrc} alt={siteName} fill className="object-cover rounded-xl" />
                            </div>
                            <span className="font-bold text-lg text-[#2a1400]">{siteName}</span>
                        </Link>
                        <button onClick={closeMobileMenu} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#faf5f0] transition-colors" aria-label="Close menu">
                            <X className="w-5 h-5 text-[#4a3520]" />
                        </button>
                    </div>

                    {/* Mobile Search */}
                    <div className="px-5 py-4">
                        <form action="/search" className="relative">
                            <input type="text" name="q" placeholder="Search recipes..." className="w-full pl-4 pr-11 py-3 rounded-xl border-2 border-[#e6d0ca] bg-[#faf7f2] text-[#4a3520] placeholder:text-[#b39e99] focus:outline-none focus:border-[#b55c5c] text-sm font-medium" />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b55c5c]" aria-label="Search">
                                <Search className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    {/* Mobile Nav Links */}
                    <div className="px-2">
                        {/* Recipes Accordion */}
                        <div className="border-b border-[#f0ebe3]">
                            <button
                                className="flex items-center justify-between w-full px-4 py-4 text-[15px] font-bold text-[#2D2727] uppercase tracking-wider"
                                onClick={() => setMobileRecipeOpen(!mobileRecipeOpen)}
                            >
                                Recipes
                                <ChevronDown className={`w-4 h-4 text-[#9c938a] transition-transform duration-300 ${mobileRecipeOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${mobileRecipeOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-2 pb-3">
                                    {recipes.map((recipe) => (
                                        <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#faf5f0] transition-colors" onClick={closeMobileMenu}>
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#f4f0ea] relative">
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
                                    <Link href="/recipes" className="block text-center text-[13px] font-bold text-[#7B2D3B] py-3 mt-1 rounded-xl hover:bg-[#f5eced] transition-colors normal-case tracking-normal" onClick={closeMobileMenu}>
                                        Browse All Recipes →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Categories Accordion */}
                        <div className="border-b border-[#f0ebe3]">
                            <button
                                className="flex items-center justify-between w-full px-4 py-4 text-[15px] font-bold text-[#2D2727] uppercase tracking-wider"
                                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                            >
                                Categories
                                <ChevronDown className={`w-4 h-4 text-[#9c938a] transition-transform duration-300 ${mobileCatOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${mobileCatOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-2 pb-3 grid grid-cols-2 gap-2">
                                    {categories.map((cat) => (
                                        <Link key={cat.id} href={`/categories/${cat.slug}`} className="flex items-center gap-2.5 px-3 py-3 rounded-xl hover:bg-[#faf5f0] transition-colors" onClick={closeMobileMenu}>
                                            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#f4f0ea] relative">
                                                {cat.image ? <Image src={cat.image} alt={cat.name} fill className="object-cover" /> : <span className="w-full h-full flex items-center justify-center text-sm">🍽️</span>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-[#2D2727] truncate normal-case tracking-normal">{cat.name}</p>
                                                <p className="text-[11px] text-[#9c938a] normal-case tracking-normal">{cat.recipeCount}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <div className="px-2 pb-3">
                                    <Link href="/categories" className="block text-center text-[13px] font-bold text-[#7B2D3B] py-3 rounded-xl hover:bg-[#f5eced] transition-colors normal-case tracking-normal" onClick={closeMobileMenu}>
                                        View All Categories →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Chefs Link */}
                        <Link href="/chefs" className="flex items-center px-4 py-4 text-[15px] font-bold text-[#2D2727] uppercase tracking-wider border-b border-[#f0ebe3] hover:bg-[#faf5f0] transition-colors" onClick={closeMobileMenu}>
                            Chefs
                        </Link>

                        {/* Secondary Links */}
                        <div className="mt-4 px-3 pb-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9c938a] mb-3 px-1">Quick Links</p>
                            <div className="space-y-1">
                                {[
                                    { href: '/', label: 'Home' },
                                    { href: '/about', label: 'About' },
                                    { href: '/contact', label: 'Contact' },
                                    { href: '/privacy', label: 'Privacy Policy' },
                                    { href: '/terms', label: 'Terms of Use' },
                                ].map(link => (
                                    <Link key={link.href} href={link.href} className="block px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#6B6058] hover:text-[#7B2D3B] hover:bg-[#faf5f0] transition-colors" onClick={closeMobileMenu}>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
