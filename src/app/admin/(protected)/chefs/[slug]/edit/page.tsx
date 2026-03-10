import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import ChefForm from '../../ChefForm'

export const metadata: Metadata = { title: 'Edit Chef' }

export default async function EditChefPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const chef = await prisma.chef.findUnique({ where: { slug } })
    if (!chef) notFound()
    return <ChefForm chef={chef} />
}
