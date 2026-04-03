'use client'

import { useState, useEffect } from 'react'
import { useBranding } from '@/components/BrandingProvider'
import { usePathname } from 'next/navigation'

export default function PinterestHoverOverlay() {
    const { socialLinks } = useBranding()
    const pathname = usePathname()

    // Disable in the admin area so it doesn't get annoying when managing posts
    const isAdmin = pathname?.startsWith('/admin')

    const [hoveredImg, setHoveredImg] = useState<HTMLImageElement | null>(null)
    const [rect, setRect] = useState<DOMRect | null>(null)

    // Make sure we have a valid Pinterest URL from the dashboard
    const pinterestUrl = socialLinks?.pinterest || "https://pinterest.com/"

    useEffect(() => {
        setHoveredImg(null)
    }, [pathname])

    useEffect(() => {
        if (isAdmin) return

        let timeoutId: NodeJS.Timeout

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const img = target.tagName === 'IMG' ? target as HTMLImageElement : null
            const isBtn = target.closest('#pinterest-overlay-btn')

            if (isBtn) {
                clearTimeout(timeoutId)
                return
            }

            if (img) {
                // We only show it on relatively decently sized images to avoid UI spam on icons/thumbnails
                if (img.width > 200 && img.height > 150) {
                    clearTimeout(timeoutId)
                    setHoveredImg(img)
                    setRect(img.getBoundingClientRect())
                }
            } else {
                // If moving off an image, give a small grace period so they can reach the button
                timeoutId = setTimeout(() => {
                    setHoveredImg(null)
                }, 200)
            }
        }

        const handleScroll = () => {
             if (hoveredImg) {
                 const newRect = hoveredImg.getBoundingClientRect()
                 // If scrolled out of view, hide
                 if (newRect.bottom < 0 || newRect.top > window.innerHeight) {
                     setHoveredImg(null)
                 } else {
                     setRect(newRect)
                 }
             }
        }

        document.addEventListener('mouseover', handleMouseOver)
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll)

        return () => {
            document.removeEventListener('mouseover', handleMouseOver)
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
            clearTimeout(timeoutId)
        }
    }, [hoveredImg, isAdmin])

    if (!hoveredImg || !rect || isAdmin) return null

    return (
        <div id="pinterest-overlay-btn"
           className="fixed z-[9999] p-3" // invisible padding area makes it easier to keep hovered
           style={{
               top: Math.max(0, rect.top) + (rect.height / 2) - 32, // Perfect vertical center (32 is half of the 64px wrapper)
               left: rect.left + (rect.width / 2) - 32, // Perfect horizontal center
           }}
           onMouseLeave={() => setHoveredImg(null)}
        >
            <a href={pinterestUrl}
               target="_blank"
               rel="noopener noreferrer"
               title="View on Pinterest"
               className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E60023] hover:bg-[#ad081b] text-white shadow-xl transition-all duration-200 hover:scale-110 drop-shadow-md"
            >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.429 2.977 7.429 6.945 0 4.155-2.617 7.509-6.253 7.509-1.221 0-2.368-.636-2.761-1.385l-.752 2.868c-.272 1.037-1.009 2.338-1.503 3.125 1.258.384 2.598.592 3.987.592 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.638 0 12.017 0z" />
                </svg>
            </a>
        </div>
    )
}
