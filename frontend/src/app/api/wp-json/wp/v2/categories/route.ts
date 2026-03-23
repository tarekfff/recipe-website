import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/wp-json/wp/v2/categories — WordPress compatible endpoint
export async function GET(request: Request) {
    try {
        const host = request.headers.get('host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const baseUrl = `${protocol}://${host}`

        const categories = await prisma.category.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { recipes: { where: { status: 'PUBLISHED', deletedAt: null } } } },
            },
        })

        // Format to match exact WordPress REST API structure
        const output = categories.map((c) => {
            // Generate a stable numeric ID from the CUID string for strict WP parsers
            let numericId = 0
            for (let i = 0; i < c.id.length; i++) {
                numericId = (numericId << 5) - numericId + c.id.charCodeAt(i)
                numericId |= 0
            }
            numericId = Math.abs(numericId) || 1

            return {
                id: numericId,
                real_cuid: c.id, // Keeping original ID accessible just in case
                count: c._count.recipes,
                description: c.description || "",
                link: `${baseUrl}/category/${c.slug}/`,
                name: c.name,
                slug: c.slug,
                taxonomy: "category",
                parent: 0,
                meta: [],
                _links: {
                    self: [
                        {
                            href: `${baseUrl}/api/wp-json/wp/v2/categories/${numericId}`,
                            targetHints: {
                                allow: ["GET", "POST", "PUT", "PATCH", "DELETE"]
                            }
                        }
                    ],
                    collection: [
                        { href: `${baseUrl}/api/wp-json/wp/v2/categories` }
                    ],
                    about: [
                        { href: `${baseUrl}/api/wp-json/wp/v2/taxonomies/category` }
                    ],
                    "wp:post_type": [
                        { href: `${baseUrl}/api/wp-json/wp/v2/posts?categories=${numericId}` }
                    ],
                    curies: [
                        { name: "wp", href: "https://api.w.org/{rel}", templated: true }
                    ]
                }
            }
        })

        // Return a raw array just like WP
        return NextResponse.json(output)
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { code: 'internal_server_error', message: 'Failed to fetch categories', data: { status: 500 } },
            { status: 500 }
        )
    }
}
