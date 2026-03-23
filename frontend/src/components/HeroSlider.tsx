'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
    {
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=2000&q=80',
        headline: 'Recipes Worth Savoring',
        sub: 'Curated flavors from passionate chefs — every dish has a story waiting to be tasted.',
    },
    {
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2000&q=80',
        headline: 'Cook With Confidence',
        sub: 'From weeknight simplicity to weekend spectacle — find your next culinary inspiration.',
    },
]

export default function HeroSlider() {
    const [current, setCurrent] = useState(0)

    const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [])
    const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [])

    useEffect(() => {
        const t = setInterval(next, 10000)
        return () => clearInterval(t)
    }, [next])

    return (
        <section className="relative w-full min-h-screen overflow-hidden" style={{ background: 'var(--ink)' }}>
            {slides.map((s, i) => (
                <div key={i}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out
                                ${current === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <Image src={s.image} alt={s.headline} fill priority={i === 0}
                        className="object-cover" sizes="100vw" />
                    {/* Overlay: diagonal burgundy-tinted gradient */}
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(135deg, rgba(90,31,43,0.82) 0%, rgba(28,25,23,0.55) 50%, transparent 100%)' }} />
                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-[580px]">
                            <div className="inline-block px-3 py-1 rounded-full mb-6 text-[11px] font-semibold uppercase tracking-[0.2em]"
                                style={{ background: 'rgba(200,149,108,0.25)', color: 'var(--gold-light)', border: '1px solid rgba(200,149,108,0.3)' }}>
                                Editor&apos;s Selection
                            </div>
                            <h2 className="font-display text-[42px] sm:text-[56px] lg:text-[72px] font-bold text-white leading-[1.05] mb-5 tracking-tight">
                                {s.headline}
                            </h2>
                            <p className="text-lg sm:text-xl mb-10 leading-relaxed max-w-md"
                                style={{ color: 'rgba(255,255,255,0.78)' }}>
                                {s.sub}
                            </p>
                            <Link href="/recipes"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold
                                           transition-all duration-300 shadow-lg"
                                style={{
                                    background: 'var(--burgundy)',
                                    color: 'white',
                                    boxShadow: '0 8px 30px rgba(123,45,59,0.45)',
                                }}
                                onMouseOver={e => (e.currentTarget.style.background = 'var(--gold)')}
                                onMouseOut={e => (e.currentTarget.style.background = 'var(--burgundy)')}>
                                Explore Recipes
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Arrows */}
            <button onClick={prev} aria-label="Previous slide"
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full
                           flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', backdropFilter: 'blur(8px)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} aria-label="Next slide"
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full
                           flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', backdropFilter: 'blur(8px)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2.5">
                {slides.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
                        className="h-[6px] rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: current === i ? 40 : 12,
                            background: current === i ? 'var(--gold)' : 'rgba(255,255,255,0.35)',
                        }} />
                ))}
            </div>
        </section>
    )
}
