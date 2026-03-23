'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function FeedbackActions({ id, status }: { id: string; status: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    async function action(act: 'approve' | 'reject' | 'delete') {
        setLoading(act)
        
        const promise = async () => {
            if (act === 'delete') {
                const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' })
                if (!res.ok) throw new Error('Failed to delete')
            } else {
                const res = await fetch(`/api/feedback/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: act }),
                })
                if (!res.ok) throw new Error(`Failed to ${act}`)
            }
            router.refresh()
        }

        toast.promise(promise(), {
            loading: act === 'delete' ? 'Deleting...' : `Marking as ${act}d...`,
            success: act === 'delete' ? 'Feedback deleted!' : `Feedback ${act}d successfully!`,
            error: `Failed to ${act} feedback`,
            finally: () => setLoading(null)
        })
    }

    return (
        <div className="flex items-center gap-1">
            {status !== 'APPROVED' && (
                <button onClick={() => action('approve')} disabled={!!loading}
                    title="Approve"
                    className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50">
                    {loading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                </button>
            )}
            {status !== 'REJECTED' && (
                <button onClick={() => action('reject')} disabled={!!loading}
                    title="Reject"
                    className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50">
                    {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                </button>
            )}
            <button onClick={() => action('delete')} disabled={!!loading}
                title="Delete"
                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                {loading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
        </div>
    )
}
