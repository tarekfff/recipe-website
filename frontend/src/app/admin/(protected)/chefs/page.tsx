import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, Edit2, ChefHat } from 'lucide-react'
import { ChefActions } from './ChefActions'

export const metadata: Metadata = { title: 'Chefs' }
export const dynamic = 'force-dynamic'

export default async function ChefsPage() {
    const chefs = await prisma.chef.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { recipes: true } } },
    })

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">Chefs</h1>
                    <p className="text-gray-500 text-sm">{chefs.length} chefs</p>
                </div>
                <Link href="/admin/chefs/new"
                    className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors">
                    <Plus className="w-4 h-4" /> Add Chef
                </Link>
            </div>

            {chefs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 text-center py-16 text-gray-400">
                    <ChefHat className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No chefs yet.</p>
                    <Link href="/admin/chefs/new"
                        className="text-brand-600 hover:underline text-sm font-medium mt-1 block">
                        Add your first chef →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chefs.map((chef) => (
                        <div key={chef.id} className="bg-white rounded-xl border border-gray-100 p-5 group hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {chef.avatar
                                        ? <img src={chef.avatar} alt={chef.name} className="w-full h-full object-cover" />
                                        : <ChefHat className="w-6 h-6 text-sage-500" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{chef.name}</p>
                                    <p className="text-xs text-gray-400 font-mono">{chef.slug}</p>
                                    <p className="text-xs text-gray-500 mt-1">{chef._count.recipes} recipes</p>
                                </div>
                            </div>
                            {chef.bio && (
                                <p className="text-xs text-gray-500 mt-3 line-clamp-2">{chef.bio}</p>
                            )}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                                <Link href={`/admin/chefs/${chef.slug}/edit`}
                                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-brand-600 font-medium py-1.5 rounded-lg hover:bg-brand-50 transition-colors border border-gray-100">
                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                </Link>
                                <ChefActions slug={chef.slug} name={chef.name} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
