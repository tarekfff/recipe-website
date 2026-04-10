'use client'

import { useState } from 'react'
import { Printer, BookmarkPlus, Bookmark, Share2, Check, Link2, Facebook, Twitter } from 'lucide-react'

interface RecipeActionsProps {
    recipeTitle: string
    recipeSlug: string
}

export default function RecipeActions({ recipeTitle, recipeSlug }: RecipeActionsProps) {
    const [saved, setSaved] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [copied, setCopied] = useState(false)

    const handlePrint = () => {
        window.print()
    }

    const handleSave = () => {
        // Toggle bookmark in localStorage
        const key = 'savedRecipes'
        const stored = JSON.parse(localStorage.getItem(key) || '[]') as string[]
        if (stored.includes(recipeSlug)) {
            const updated = stored.filter(s => s !== recipeSlug)
            localStorage.setItem(key, JSON.stringify(updated))
            setSaved(false)
        } else {
            stored.push(recipeSlug)
            localStorage.setItem(key, JSON.stringify(stored))
            setSaved(true)
        }
    }

    const handleShare = () => {
        // Try native share API first
        if (navigator.share) {
            navigator.share({
                title: recipeTitle,
                url: window.location.href,
            }).catch(() => { })
        } else {
            setShowShare(!showShare)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback
            const input = document.createElement('input')
            input.value = window.location.href
            document.body.appendChild(input)
            input.select()
            document.execCommand('copy')
            document.body.removeChild(input)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')
    }

    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(recipeTitle)}&url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')
    }

    const shareOnPinterest = () => {
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(recipeTitle)}`, '_blank', 'width=600,height=400')
    }

    // Check if already saved on mount
    if (typeof window !== 'undefined' && !saved) {
        const stored = JSON.parse(localStorage.getItem('savedRecipes') || '[]') as string[]
        if (stored.includes(recipeSlug) && !saved) {
            // We use a timeout to avoid state update during render
            setTimeout(() => setSaved(true), 0)
        }
    }

    return (
        <div className="rp-actions" style={{ position: 'relative' }}>
            {/* Print */}
            <button
                className="rp-action-btn"
                aria-label="Print recipe"
                title="Print recipe"
                onClick={handlePrint}
            >
                <Printer className="w-4 h-4" />
            </button>

            {/* Bookmark / Save */}
            <button
                className="rp-action-btn"
                aria-label={saved ? 'Unsave recipe' : 'Save recipe'}
                title={saved ? 'Unsave recipe' : 'Save recipe'}
                onClick={handleSave}
                style={saved ? { background: '#7B2D3B', color: 'white', borderColor: '#7B2D3B' } : undefined}
            >
                {saved ? <Bookmark className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
            </button>

            {/* Share */}
            <button
                className="rp-action-btn"
                aria-label="Share recipe"
                title="Share recipe"
                onClick={handleShare}
            >
                <Share2 className="w-4 h-4" />
            </button>

            {/* Share dropdown (fallback for desktop without native share) */}
            {showShare && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                        border: '1px solid #f0ebe3',
                        padding: '8px',
                        minWidth: '200px',
                        zIndex: 100,
                        fontFamily: "'Poppins', system-ui, sans-serif",
                        animation: 'fadeSlideIn 0.2s ease-out',
                    }}
                >
                    <button
                        onClick={handleCopyLink}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 14px',
                            border: 'none',
                            background: copied ? '#f0fdf4' : 'transparent',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: copied ? '#16a34a' : '#2D2727',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { if (!copied) e.currentTarget.style.background = '#faf5f0' }}
                        onMouseLeave={(e) => { if (!copied) e.currentTarget.style.background = 'transparent' }}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                        {copied ? 'Link Copied!' : 'Copy Link'}
                    </button>
                    <button
                        onClick={shareOnFacebook}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 14px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#2D2727',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#faf5f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <Facebook className="w-4 h-4 text-[#1877F2]" />
                        Facebook
                    </button>
                    <button
                        onClick={shareOnTwitter}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 14px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#2D2727',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#faf5f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                        Twitter / X
                    </button>
                    <button
                        onClick={shareOnPinterest}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 14px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#2D2727',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#faf5f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg className="w-4 h-4" fill="#bd081c" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.429 2.977 7.429 6.945 0 4.155-2.617 7.509-6.253 7.509-1.221 0-2.368-.636-2.761-1.385l-.752 2.868c-.272 1.037-1.009 2.338-1.503 3.125 1.258.384 2.598.592 3.987.592 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.638 0 12.017 0z" />
                        </svg>
                        Pinterest
                    </button>
                </div>
            )}

            {/* Click outside to close share dropdown */}
            {showShare && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    onClick={() => setShowShare(false)}
                />
            )}
        </div>
    )
}
