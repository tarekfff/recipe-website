import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth, requireRole, apiPaginated, apiSuccess, apiError } from '@/lib/api-auth'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// GET /api/apikeys — Admin: list API keys
export async function GET(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'SUPER_ADMIN')
    if (authError) return authError

    try {
        const keys = await prisma.apiKey.findMany({
            where: { userId: user!.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, name: true, prefix: true, scopes: true,
                expiresAt: true, lastUsedAt: true, createdAt: true,
            },
        })
        return apiSuccess(keys)
    } catch { return apiError('Server error', 500) }
}

// POST /api/apikeys — Admin: create new API key
export async function POST(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'SUPER_ADMIN')
    if (authError) return authError

    try {
        const body = await request.json()
        const { name, scopes = ['read'], expiresAt } = body
        if (!name) return apiError('name is required')

        // Generate a secure random key: rcp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        const randomPart = crypto.randomBytes(24).toString('hex')
        const rawKey = `rcp_${randomPart}`
        const prefix = rawKey.substring(0, 8)
        const keyHash = await bcrypt.hash(rawKey, 10)

        const apiKey = await prisma.apiKey.create({
            data: {
                name,
                keyHash,
                prefix,
                scopes,
                userId: user!.id,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
        })

        // Return the raw key ONCE — never shown again
        return NextResponse.json({
            success: true,
            data: {
                id: apiKey.id,
                name: apiKey.name,
                key: rawKey, // shown only once!
                prefix: apiKey.prefix,
                scopes: apiKey.scopes,
                expiresAt: apiKey.expiresAt,
                createdAt: apiKey.createdAt,
            },
            message: 'API key created. Save it now — it will not be shown again.',
        }, { status: 201 })
    } catch { return apiError('Failed to create API key', 500) }
}

// DELETE /api/apikeys — Revoke by id (in body or query)
export async function DELETE(request: Request) {
    const user = await verifyAuth(request)
    const authError = requireRole(user, 'SUPER_ADMIN')
    if (authError) return authError

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return apiError('id is required')

        await prisma.apiKey.deleteMany({ where: { id, userId: user!.id } })
        return apiSuccess(null, 'API key revoked')
    } catch { return apiError('Failed to revoke API key', 500) }
}
