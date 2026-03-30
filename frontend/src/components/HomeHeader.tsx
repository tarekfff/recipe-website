'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search } from 'lucide-react'
import { useBranding } from '@/components/BrandingProvider'

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
    { label: 'Articles', href: '#' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
]

export default function HomeHeader() {
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { siteName, logo } = useBranding()
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
                        <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer"
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
                        <div className="flex items-center gap-8 text-[15px] font-bold tracking-widest uppercase"
                            style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--slate)' }}>
                            {mainLinks.map(link => (
                                <Link key={link.label} href={link.href}
                                    className="hover:text-[#7B2D3B] transition-colors flex items-center gap-1">
                                    {link.label}
                                    {link.dropdown && (
                                        <span className="text-[10px] opacity-50">▼</span>
                                    )}
                                </Link>
                            ))}
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
                        {mobileLinks.map(link => (
                            <Link key={link.label} href={link.href}
                                onClick={() => setOpen(false)}
                                className="py-3 px-3 text-[14px] font-semibold uppercase tracking-wider rounded-lg
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
