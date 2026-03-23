import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/wp-json/wp/v2/posts — WordPress compatible endpoint for posts (Recipes)
export async function GET(request: Request) {
    try {
        const host = request.headers.get('host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const baseUrl = `${protocol}://${host}`

        // Get all published recipes
        const recipes = await prisma.recipe.findMany({
            where: {
                status: 'PUBLISHED',
                deletedAt: null
            },
            orderBy: {
                publishedAt: 'desc'
            },
            select: {
                slug: true,
                title: true
            }
        })

        // Format to match exact WordPress REST API structure for simple post lookups
        const output = recipes.map((recipe) => {
            return {
                link: `${baseUrl}/recipes/${recipe.slug}/`,
                title: {
                    rendered: recipe.title
                }
            }
        })

        return NextResponse.json(output)
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { code: 'internal_server_error', message: 'Failed to fetch posts', data: { status: 500 } },
            { status: 500 }
        )
    }
}
