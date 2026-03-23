'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type Chef = {
    id: string; name: string; slug: string
    bio: string | null; avatar: string | null
}

export default function ChefForm({ chef }: { chef?: Chef }) {
    const router = useRouter()
    const isEdit = !!chef

    const [name, setName] = useState(chef?.name || '')
    const [bio, setBio] = useState(chef?.bio || '')
    const [avatar, setAvatar] = useState(chef?.avatar || '')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const body = { name, bio, avatar }
        
        try {
            const res = isEdit
                ? await fetch(`/api/chefs/${chef.slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                : await fetch('/api/chefs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

            const data = await res.json()
            setLoading(false)

            if (!data.success) {
                toast.error(data.message || 'Failed to save chef')
                return
            }
            
            toast.success(isEdit ? 'Chef updated successfully!' : 'Chef added successfully!')
            router.push('/admin/chefs')
            router.refresh()
        } catch (err) {
            setLoading(false)
            toast.error('Network error. Please try again.')
        }
    }

    return (
        <div className="p-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/chefs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                </Link>
                <h1 className="font-display text-2xl font-bold text-gray-900">
                    {isEdit ? 'Edit Chef' : 'Add Chef'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                    <div className="flex gap-6">
                        {/* Avatar preview */}
                        <div className="w-20 h-20 rounded-full bg-sage-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {avatar
                                ? <img src={avatar} alt="preview" className="w-full h-full object-cover" />
                                : <span className="text-3xl">👨‍🍳</span>
                            }
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                            <input value={name} onChange={e => setName(e.target.value)} required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Chef name" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar URL</label>
                        <input value={avatar} onChange={e => setAvatar(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="https://..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            placeholder="A few sentences about this chef..." />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 bg-brand-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 transition-colors">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? 'Save Changes' : 'Add Chef'}
                    </button>
                </div>
            </form>
        </div>
    )
}
