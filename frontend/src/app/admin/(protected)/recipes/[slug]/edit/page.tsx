import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import RecipeEditor from '../../RecipeEditor'

export const metadata: Metadata = { title: 'Edit Recipe' }
export const dynamic = 'force-dynamic'

export default async function EditRecipePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const [recipe, categories, chefs] = await Promise.all([
        prisma.recipe.findUnique({
            where: { slug, deletedAt: null },
            select: {
                id: true, title: true, description: true, content: true, featuredImage: true,
                difficulty: true, prepTime: true, cookTime: true, servings: true,
                calories: true, categoryId: true, chefId: true, slug: true,
                ingredients: true, instructions: true, seo: true,
            },
        }),
        prisma.category.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
        prisma.chef.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    ])

    if (!recipe) notFound()

    return (
        <RecipeEditor
            categories={categories}
            chefs={chefs}
            recipe={{
                ...recipe,
                ingredients: recipe.ingredients as { name: string; amount: string; unit: string }[],
                instructions: recipe.instructions as { step: number; text: string }[],
            }}
        />
    )
}
