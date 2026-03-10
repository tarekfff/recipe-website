'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Props = {
    category?: {
        id: string; name: string; nameAr: string | null
        slug: string; description: string | null; image: string | null; order: number
    }
}

export default function CategoryForm({ category }: Props) {
    const router = useRouter()
    const isEdit = !!category

    const [name, setName] = useState(category?.name || '')
    const [nameAr, setNameAr] = useState(category?.nameAr || '')
    const [description, setDescription] = useState(category?.description || '')
    const [image, setImage] = useState(category?.image || '')
    const [order, setOrder] = useState(String(category?.order ?? 0))
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const body = { name, nameAr, description, image, order: parseInt(order) }
        const res = isEdit
            ? await fetch(`/api/categories/${category.slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            : await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

        const data = await res.json()
        setLoading(false)

        if (!data.success) { setError(data.message || 'Failed'); return }
        router.push('/admin/categories')
        router.refresh()
    }

    return (
        <div className="p-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/categories" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Category' : 'New Category'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
                )}

                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (English) *</label>
                            <input value={name} onChange={e => setName(e.target.value)} required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="e.g. Main Dishes" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (Arabic)</label>
                            <input value={nameAr} onChange={e => setNameAr(e.target.value)} dir="rtl"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="مثال: الأطباق الرئيسية" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            placeholder="Short description of this category..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                            <input value={image} onChange={e => setImage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
                            <input type="number" value={order} onChange={e => setOrder(e.target.value)} min={0}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 bg-brand-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 transition-colors">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? 'Save Changes' : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    )
}
