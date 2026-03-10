import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import CategoryForm from '../../CategoryForm'

export const metadata: Metadata = { title: 'Edit Category' }

export default async function EditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const category = await prisma.category.findUnique({ where: { slug } })
    if (!category) notFound()
    return <CategoryForm category={category} />
}
