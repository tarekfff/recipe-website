import { mockRecipes, mockCategories, mockChefs } from '@/lib/mock-data'
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/recipes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/chefs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        ...mockRecipes.map((r) => ({
            url: `${baseUrl}/recipes/${r.slug}`,
            lastModified: r.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })),
        ...mockCategories.map((c) => ({
            url: `${baseUrl}/categories/${c.slug}`,
            lastModified: c.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        })),
        ...mockChefs.map((c) => ({
            url: `${baseUrl}/chefs/${c.slug}`,
            lastModified: c.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        })),
    ]
}
