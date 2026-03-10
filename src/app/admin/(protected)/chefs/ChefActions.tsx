'use client'
import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ChefActions({ id, name }: { id: string; name: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirm(`Delete chef "${name}"? Their recipes will remain but won't have a chef.`)) return
        setLoading(true)
        const res = await fetch(`/api/chefs/${id}`, { method: 'DELETE' })
        if (res.ok) router.refresh()
        setLoading(false)
    }

    return (
        <button onClick={handleDelete} disabled={loading}
            className="flex items-center justify-center gap-1.5 text-xs text-red-500 hover:bg-red-50 font-medium py-1.5 px-2 rounded-lg transition-colors border border-red-100 disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
        </button>
    )
}
