'use client'

import { useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'

export default function NewsletterCard() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setStatus('loading')
        await new Promise(r => setTimeout(r, 700))
        setStatus('success')
    }

    return (
        <div className="rounded-2xl overflow-hidden shadow-lg max-w-xl mx-auto"
            style={{
                background: 'var(--parchment)',
                border: '1px solid rgba(28,25,23,0.06)',
                boxShadow: '0 8px 40px rgba(28,25,23,0.06)',
            }}>
            {status === 'success' ? (
                <div className="flex flex-col items-center text-center py-14 px-8 animate-fade-up">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                        style={{ background: 'rgba(123,45,59,0.08)' }}>
                        <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--burgundy)' }} />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                        You&apos;re on the list!
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--slate)' }}>
                        Check your inbox for your first batch of recipes.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center text-center py-12 px-8">
                    <div className="w-12 h-12 rounded-xl inline-flex items-center justify-center mb-5"
                        style={{ background: 'rgba(123,45,59,0.08)' }}>
                        <Mail className="w-6 h-6" style={{ color: 'var(--burgundy)' }} strokeWidth={2} />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                        Get Delicious Recipes Weekly
                    </h3>
                    <p className="text-sm mb-7" style={{ color: 'var(--slate)' }}>
                        Join <strong style={{ color: 'var(--burgundy)' }}>25,000+</strong> home cooks receiving fresh ideas.
                    </p>
                    <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-2.5">
                        <input name="name" placeholder="Your name" required disabled={status === 'loading'}
                            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                            style={{
                                background: 'white',
                                border: '1px solid rgba(28,25,23,0.1)',
                                color: 'var(--ink)',
                            }} />
                        <input name="email" type="email" placeholder="your@email.com" required disabled={status === 'loading'}
                            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                            style={{
                                background: 'white',
                                border: '1px solid rgba(28,25,23,0.1)',
                                color: 'var(--ink)',
                            }} />
                        <button type="submit" disabled={status === 'loading'}
                            className="w-full py-3.5 rounded-xl font-bold text-white text-sm mt-1
                                       transition-colors duration-200 disabled:opacity-60"
                            style={{ background: 'var(--burgundy)' }}
                            onMouseOver={e => { if (status !== 'loading') (e.target as HTMLElement).style.background = 'var(--gold)' }}
                            onMouseOut={e => { if (status !== 'loading') (e.target as HTMLElement).style.background = 'var(--burgundy)' }}>
                            {status === 'loading' ? 'Subscribing…' : 'Subscribe Free →'}
                        </button>
                    </form>
                    <p className="text-[11px] font-medium tracking-wide mt-5 uppercase"
                        style={{ color: 'var(--rose)' }}>
                        Free forever · No spam · Unsubscribe anytime
                    </p>
                </div>
            )}
        </div>
    )
}
