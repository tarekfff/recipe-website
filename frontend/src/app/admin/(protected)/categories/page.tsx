import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, Edit2, Trash2, GripVertical, FolderOpen } from 'lucide-react'
import { CategoryActions } from './CategoryActions'

export const metadata: Metadata = { title: 'Categories' }
export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
        include: { _count: { select: { recipes: true } } },
    })

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500 text-sm">{categories.length} categories</p>
                </div>
                <Link href="/admin/categories/new"
                    className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors">
                    <Plus className="w-4 h-4" /> New Category
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {categories.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No categories yet.</p>
                        <Link href="/admin/categories/new"
                            className="text-brand-600 hover:underline text-sm font-medium mt-1 block">
                            Create your first category →
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="w-8 px-4 py-3"></th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Arabic</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Recipes</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Order</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-3 text-gray-300 cursor-grab">
                                        <GripVertical className="w-4 h-4" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                                                    <FolderOpen className="w-4 h-4 text-brand-500" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{cat.nameAr || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-medium text-gray-700">{cat._count.recipes}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">{cat.order}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/categories/${cat.slug}/edit`}
                                                className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <CategoryActions id={cat.id} name={cat.name} recipeCount={cat._count.recipes} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
