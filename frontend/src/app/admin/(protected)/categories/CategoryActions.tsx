'use client'
import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CategoryActions({ slug, name, recipeCount }: { slug: string; name: string; recipeCount: number }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (recipeCount > 0) {
            alert(`Cannot delete "${name}" — it has ${recipeCount} recipe(s). Move them to another category first.`)
            return
        }
        if (!confirm(`Delete category "${name}"?`)) return
        setLoading(true)
        await fetch(`/api/categories/${slug}`, { method: 'DELETE' })
        router.refresh()
        setLoading(false)
    }

    return (
        <button onClick={handleDelete} disabled={loading}
            className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    )
}
