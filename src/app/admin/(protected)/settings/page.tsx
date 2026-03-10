import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { ApiKeyManager } from '@/components/admin/ApiKeyManager'
import { Settings, Key, Globe, Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
    const session = await auth()
    const [settings, apiKeysRaw] = await Promise.all([
        prisma.siteSettings.findFirst(),
        prisma.apiKey.findMany({
            where: { userId: session?.user?.id || '' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, name: true, prefix: true, scopes: true,
                expiresAt: true, lastUsedAt: true, createdAt: true,
            },
        }),
    ])

    // Serialize dates for client component (Dates aren't serializable across RSC boundary)
    const apiKeys = apiKeysRaw.map((k) => ({
        ...k,
        expiresAt: k.expiresAt?.toISOString() ?? null,
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        createdAt: k.createdAt.toISOString(),
    }))

    const isSuperAdmin = (session?.user as { role?: string })?.role === 'SUPER_ADMIN'

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your platform configuration</p>
            </div>

            <div className="space-y-8">
                {/* Site Settings */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
                        <Globe className="w-4 h-4 text-brand-500" />
                        Site Settings
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                {settings?.siteName || 'Recipe Platform'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
                            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                {settings?.siteUrl || 'http://localhost:3000'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                {settings?.defaultLanguage || 'en'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Mode</label>
                            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                {settings?.maintenanceMode ? '🔴 Enabled' : '🟢 Disabled'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* API Key Management */}
                {isSuperAdmin && (
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                            <Key className="w-4 h-4 text-brand-500" />
                            API Keys
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">
                            Generate API keys for N8N, Zapier, Make, or any HTTP automation tool.
                        </p>
                        <ApiKeyManager initialKeys={apiKeys} />
                    </div>
                )}

                {/* Security Info */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Shield className="w-4 h-4 text-brand-500" />
                        Your Account
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">{session?.user?.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg font-mono">
                                {(session?.user as { role?: string })?.role || 'EDITOR'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
