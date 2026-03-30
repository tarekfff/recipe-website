'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface BrandingData {
    siteName: string
    logo: string | null
    socialLinks?: any
}

const BrandingContext = createContext<BrandingData>({
    siteName: 'Recipe Platform',
    logo: null,
    socialLinks: null,
})

export function useBranding() {
    return useContext(BrandingContext)
}

export function BrandingProvider({
    children,
    initial,
}: {
    children: ReactNode
    initial?: BrandingData
}) {
    const [branding, setBranding] = useState<BrandingData>(
        initial || { siteName: 'Recipe Platform', logo: null, socialLinks: null }
    )

    useEffect(() => {
        // If we already have initial data from SSR, skip the fetch
        if (initial) return

        fetch('/api/public/branding')
            .then(res => res.json())
            .then(data => {
                setBranding({
                    siteName: data.siteName || 'Recipe Platform',
                    logo: data.logo || null,
                    socialLinks: data.socialLinks || null,
                })
            })
            .catch(() => {
                // Keep defaults on error
            })
    }, [initial])

    return (
        <BrandingContext.Provider value={branding}>
            {children}
        </BrandingContext.Provider>
    )
}
