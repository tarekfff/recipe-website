import { ApiKeyManager } from '@/components/admin/ApiKeyManager'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'API Keys' }
export const dynamic = 'force-dynamic'

export default async function ApiKeysPage() {
    const session = await auth()

    const keysRaw = await prisma.apiKey.findMany({
        where: { userId: session?.user?.id || '' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, prefix: true, scopes: true, expiresAt: true, lastUsedAt: true, createdAt: true },
    })

    const apiKeys = keysRaw.map((k) => ({
        ...k,
        expiresAt: k.expiresAt?.toISOString() ?? null,
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        createdAt: k.createdAt.toISOString(),
    }))

    return (
        <div className="p-8 max-w-3xl">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-gray-900">API Keys</h1>
                <p className="text-gray-500 text-sm">Generate and manage API keys for N8N and automation tools</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <ApiKeyManager initialKeys={apiKeys} />
            </div>
        </div>
    )
}
