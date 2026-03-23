import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import RecipeEditor from '../RecipeEditor'

export const metadata: Metadata = { title: 'New Recipe' }

export default async function NewRecipePage() {
    const [categories, chefs] = await Promise.all([
        prisma.category.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
        prisma.chef.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    ])

    return <RecipeEditor categories={categories} chefs={chefs} />
}
