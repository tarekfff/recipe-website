'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UtensilsCrossed, Loader2, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const result = await signIn('credentials', {
            email, password, redirect: false,
        })

        setLoading(false)

        if (result?.error) {
            setError('Invalid email or password')
        } else {
            router.push(callbackUrl)
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-8 text-white text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <UtensilsCrossed className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="font-serif text-2xl font-bold">Recipe Platform</h1>
                        <p className="text-orange-100 text-sm mt-1">Admin Panel — Sign In</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                placeholder="admin@example.com"
                                required autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                    placeholder="••••••••"
                                    required autoComplete="current-password"
                                />
                                <button
                                    type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>

                        <p className="text-center text-xs text-gray-400 pt-2">
                            Admin access only. Contact your administrator for credentials.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
