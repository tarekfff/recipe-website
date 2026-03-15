'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Home, Utensils, Grid, FileText, Compass, Users,
    Info, Mail, HelpCircle, Search, Shield, FileCheck,
    Cookie, AlertTriangle, Map, Rss, ArrowUp
} from 'lucide-react'

const links = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Recipes', href: '/recipes', icon: Utensils },
    { label: 'Categories', href: '/categories', icon: Grid },
    { label: 'Articles', href: '#', icon: FileText },
    { label: 'Explore', href: '#', icon: Compass },
    { label: 'Authors', href: '/chefs', icon: Users },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Mail },
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Privacy', href: '/privacy', icon: Shield },
    { label: 'Terms', href: '/terms', icon: FileCheck },
    { label: 'Cookies', href: '/cookies', icon: Cookie },
    { label: 'Disclaimer', href: '/disclaimer', icon: AlertTriangle },
    { label: 'Sitemap', href: '/sitemap.xml', icon: Map },
    { label: 'Articles Feed', href: '/feed.xml', icon: Rss },
    { label: 'Recipes Feed', href: '/recipes.xml', icon: Rss },
]

export default function HomeFooter() {
    const [showTop, setShowTop] = useState(false)

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 5000)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <footer className="w-full pt-20 pb-14 px-6"
            style={{ background: 'linear-gradient(160deg, #1C1917 0%, #2A1F1B 50%, #1C1917 100%)' }}>
            <div className="max-w-5xl mx-auto flex flex-col items-center">

                {/* Logo */}
                <span className="font-display text-3xl font-bold tracking-tight mb-2"
                    style={{ color: 'var(--gold)' }}>
                    Noir Gourmand
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.3em] mb-10"
                    style={{ color: 'rgba(200,149,108,0.5)' }}>
                    Culinary Stories
                </span>

                {/* Social */}
                <div className="flex justify-center space-x-5 mb-10">
                    <a href="https://pinterest.com/TheFoodCabin/" target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                        onMouseOver={e => { e.currentTarget.style.background = '#bd081c'; e.currentTarget.style.color = 'white' }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                        aria-label="Pinterest">
                        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.429 2.977 7.429 6.945 0 4.155-2.617 7.509-6.253 7.509-1.221 0-2.368-.636-2.761-1.385l-.752 2.868c-.272 1.037-1.009 2.338-1.503 3.125 1.258.384 2.598.592 3.987.592 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.638 0 12.017 0z" />
                        </svg>
                    </a>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 mb-12">
                    {links.map(({ label, href, icon: Icon }) => (
                        <Link key={label} href={href}
                            className="flex items-center gap-1.5 text-sm transition-colors duration-200"
                            style={{ color: 'rgba(255,255,255,0.45)' }}
                            onMouseOver={e => (e.currentTarget.style.color = 'var(--gold)')}
                            onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="w-20 h-px mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    © {new Date().getFullYear()} Noir Gourmand. All rights reserved.
                </p>
            </div>

            {/* Back-to-top */}
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed right-6 p-3 rounded-full shadow-xl transition-all duration-500 z-50
                            ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
                style={{
                    bottom: 100,
                    background: 'var(--burgundy)',
                    color: 'white',
                    boxShadow: '0 8px 30px rgba(123,45,59,0.4)',
                }}
                aria-label="Back to top">
                <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            </button>
        </footer>
    )
}
