import { prisma } from '@/lib/db'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const [recipes, categories, chefs] = await Promise.all([
        prisma.recipe.findMany({
            where: { status: 'PUBLISHED', deletedAt: null },
            select: { slug: true, updatedAt: true },
        }),
        prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.chef.findMany({ select: { slug: true, updatedAt: true } }),
    ])

    return [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/recipes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/chefs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        ...recipes.map((r) => ({
            url: `${baseUrl}/recipes/${r.slug}`,
            lastModified: r.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })),
        ...categories.map((c) => ({
            url: `${baseUrl}/categories/${c.slug}`,
            lastModified: c.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        })),
        ...chefs.map((c) => ({
            url: `${baseUrl}/chefs/${c.slug}`,
            lastModified: c.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        })),
    ]
}
