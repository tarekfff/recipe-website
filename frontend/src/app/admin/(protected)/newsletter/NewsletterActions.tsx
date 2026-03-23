'use client'
import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function NewsletterActions({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirm('Remove this subscriber?')) return
        setLoading(true)
        
        toast.promise(
            async () => {
                const res = await fetch(`/api/newsletter?id=${id}`, { method: 'DELETE' })
                if (!res.ok) throw new Error('Failed to remove subscriber')
                router.refresh()
            },
            {
                loading: 'Removing subscriber...',
                success: 'Subscriber removed!',
                error: 'Failed to remove subscriber',
                finally: () => setLoading(false)
            }
        )
    }

    return (
        <button onClick={handleDelete} disabled={loading}
            className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    )
}
