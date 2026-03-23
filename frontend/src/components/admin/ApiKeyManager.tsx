'use client'

import { useState } from 'react'
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

interface ApiKey {
    id: string
    name: string
    prefix: string
    scopes: string[]
    expiresAt: string | null
    lastUsedAt: string | null
    createdAt: string
}

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKey[] }) {
    const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
    const [newKey, setNewKey] = useState<{ key: string; name: string } | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    async function createKey() {
        if (!name.trim()) return
        setLoading(true)
        try {
            const res = await fetch('/api/apikeys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, scopes: ['read', 'write'] }),
            })
            const data = await res.json()
            if (data.success) {
                setNewKey({ key: data.data.key, name: data.data.name })
                setKeys(prev => [data.data, ...prev])
                setName('')
                setShowForm(false)
            }
        } finally {
            setLoading(false)
        }
    }

    async function revokeKey(id: string) {
        await fetch(`/api/apikeys?id=${id}`, { method: 'DELETE' })
        setKeys(prev => prev.filter(k => k.id !== id))
    }

    function copyKey(key: string) {
        navigator.clipboard.writeText(key)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-4">
            {/* New key reveal */}
            {newKey && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-800">API Key Created — Save it now!</p>
                            <p className="text-xs text-green-600 mb-2">This is the only time the full key will be shown.</p>
                            <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
                                <code className="text-xs font-mono flex-1 text-gray-700 truncate">{newKey.key}</code>
                                <button onClick={() => copyKey(newKey.key)}
                                    className="text-green-600 hover:text-green-800 flex-shrink-0">
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button onClick={() => setNewKey(null)} className="text-green-400 hover:text-green-600 text-lg">×</button>
                    </div>
                </div>
            )}

            {/* Create form */}
            {showForm ? (
                <div className="border border-brand-200 rounded-xl p-4 bg-brand-50">
                    <p className="text-sm font-semibold text-gray-800 mb-3">New API Key</p>
                    <div className="flex gap-3">
                        <input
                            value={name} onChange={e => setName(e.target.value)}
                            placeholder="Key name (e.g. N8N Production)"
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        />
                        <button onClick={createKey} disabled={loading || !name.trim()}
                            className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create
                        </button>
                        <button onClick={() => setShowForm(false)}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 font-medium">
                    <Plus className="w-4 h-4" />
                    Generate New API Key
                </button>
            )}

            {/* Keys list */}
            <div className="space-y-2">
                {keys.map((k) => (
                    <div key={k.id} className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
                        <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{k.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{k.prefix}••••••••••••</p>
                        </div>
                        <div className="text-xs text-gray-400 hidden sm:block">
                            {k.lastUsedAt ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                        </div>
                        <div className="flex gap-1">
                            {k.scopes.map(s => (
                                <span key={s} className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                        </div>
                        <button onClick={() => revokeKey(k.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {keys.length === 0 && !showForm && (
                    <p className="text-sm text-gray-400 py-4">No API keys yet. Generate one to use with N8N.</p>
                )}
            </div>

            {/* N8N Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="text-sm font-semibold text-blue-800 mb-2">Using with N8N / Automation Tools</p>
                <p className="text-xs text-blue-700 mb-2">Add this header to any HTTP Request node:</p>
                <code className="text-xs bg-white border border-blue-200 rounded px-2 py-1 block text-blue-900">
                    X-API-Key: your-generated-key
                </code>
                <p className="text-xs text-blue-600 mt-2">
                    Example endpoint: <code className="bg-white px-1 rounded">GET /api/recipes?page=1&limit=20</code>
                </p>
            </div>
        </div>
    )
}
