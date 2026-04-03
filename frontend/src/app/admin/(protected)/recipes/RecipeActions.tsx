'use client'
import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function RecipeActions({ slug, title }: { slug: string; title: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirm(`Delete recipe "${title}"?`)) return
        setLoading(true)
        
        try {
            const res = await fetch(`/api/recipes/${slug}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete recipe')
            toast.success('Recipe deleted')
            router.refresh()
        } catch(e) {
            toast.error('Failed to delete recipe')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button onClick={handleDelete} disabled={loading}
            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
        </button>
    )
}
