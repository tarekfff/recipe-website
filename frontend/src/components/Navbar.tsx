'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin } from 'lucide-react'
import { useBranding } from '@/components/BrandingProvider'

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const { siteName, logo, socialLinks } = useBranding()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const logoSrc = logo || '/logo.png'

    return (
        <>
            {/* ── TOP BANNER ── */}
            <div className={`w-full bg-[#fcedea] text-[#8c6b65] text-xs font-semibold uppercase tracking-widest relative z-40 border-b border-[#f4dbd4] transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden py-0 border-none opacity-0' : 'py-2.5 opacity-100'}`}
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                <div className="max-w-[1400px] mx-auto px-6 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>New Recipes Straight To</span>
                        <strong className="text-[#65433d] font-bold">YOUR INBOX!</strong>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="hover:text-[#65433d] transition-colors">Home</Link>
                        <Link href="/about" className="hover:text-[#65433d] transition-colors">About</Link>
                        <Link href="/privacy" className="hover:text-[#65433d] transition-colors">Privacy Policy</Link>
                        <Link href="/contact" className="hover:text-[#65433d] transition-colors">Contact</Link>
                        <Link href="/terms" className="hover:text-[#65433d] transition-colors">Terms of Use</Link>
                        {/* Pinterest Icon Placeholder */}
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
                <nav className={`max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${isScrolled ? 'py-2 md:py-3' : 'py-4 md:py-6'}`}>

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className={`relative transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'w-12 h-12 md:w-14 md:h-14' : 'w-16 h-16 md:w-20 md:h-20'}`}>
                            <Image
                                src={logoSrc}
                                alt={`${siteName} Logo`}
                                fill
                                className="object-cover rounded-2xl drop-shadow-md"
                            />
                        </div>
                        <div className="flex flex-col justify-center mt-1">
                            <span className={`font-black tracking-tight leading-none transition-all duration-300 ${isScrolled ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'}`} style={{ color: '#2a1400' }}>
                                {siteName.split(' ')[0]?.toUpperCase() || 'PLATFORM'}
                            </span>
                            <span className="text-xs md:text-sm text-[#b55c5c] font-bold tracking-[0.2em] mt-1 uppercase" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {siteName.split(' ').slice(1).join(' ')?.toUpperCase() || 'RECIPES'}
                            </span>
                        </div>
                    </Link>

                    {/* Navigation & Search Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">

                        {/* Main Links */}
                        <div className="flex items-center gap-8 text-[15px] font-bold tracking-widest uppercase" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a3520' }}>
                            <Link href="/recipes" className="hover:text-[#b55c5c] transition-colors flex items-center gap-1">
                                Recipes <span className="text-[10px] opacity-60">▼</span>
                            </Link>
                            <Link href="/categories" className="hover:text-[#b55c5c] transition-colors flex items-center gap-1">
                                Categories <span className="text-[10px] opacity-60">▼</span>
                            </Link>
                            <Link href="/chefs" className="hover:text-[#b55c5c] transition-colors">
                                Chefs
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <form action="/search" className="relative group w-full md:w-[320px]">
                            <input
                                type="text"
                                name="q"
                                placeholder="Search recipes..."
                                className="w-full pl-5 pr-12 py-3 rounded-full border-2 border-[#e6d0ca] bg-white text-[#4a3520] placeholder:text-[#b39e99] focus:outline-none focus:border-[#b55c5c] focus:ring-4 focus:ring-[#b55c5c]/10 transition-all font-medium text-sm"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#b55c5c] hover:text-[#8c4343] transition-colors"
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </form>
                    </div>

                </nav>
            </header>
        </>
    )
}
