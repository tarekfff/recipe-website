'use client'
import { useState } from 'react'
import { Trash2, Loader2, Globe, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function RecipeActions({ slug, title, status }: { slug: string; title: string, status: string }) {
    const [loading, setLoading] = useState(false)
    const [publishLoading, setPublishLoading] = useState(false)
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

    async function handleTogglePublish() {
        const actionStr = status === 'PUBLISHED' ? 'Unpublish' : 'Publish'
        if (!confirm(`${actionStr} recipe "${title}"?`)) return
        setPublishLoading(true)
        
        try {
            const res = await fetch(`/api/recipes/${slug}/publish`, { method: 'POST' })
            if (!res.ok) throw new Error(`Failed to ${actionStr.toLowerCase()} recipe`)
            toast.success(`Recipe ${actionStr.toLowerCase()}ed`)
            router.refresh()
        } catch(e) {
            toast.error(`Failed to ${actionStr.toLowerCase()} recipe`)
        } finally {
            setPublishLoading(false)
        }
    }

    return (
        <>
            <button onClick={handleTogglePublish} disabled={loading || publishLoading}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50">
                {publishLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : status === 'PUBLISHED' ? <EyeOff className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                {status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
            </button>
            <button onClick={handleDelete} disabled={loading || publishLoading}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
            </button>
        </>
    )
}
