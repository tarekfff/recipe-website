import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER'

interface AuthUser {
    id: string
    email: string
    name: string
    role: Role
}

/**
 * Verifies either session auth or X-API-Key header.
 * Returns the authenticated user or null.
 */
export async function verifyAuth(request: Request): Promise<AuthUser | null> {
    // 1. Check API Key header first (for N8N / automation tools)
    const apiKey = request.headers.get('X-API-Key')
    if (apiKey) {
        return verifyApiKey(apiKey)
    }

    // 2. Fall back to session auth
    const session = await auth()
    if (!session?.user?.id) return null

    // Pass-through for hardcoded .env admin
    if (session.user.id === 'system-admin') {
        return session.user as AuthUser
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true, role: true },
    })
    return user as AuthUser | null
}

async function verifyApiKey(rawKey: string): Promise<AuthUser | null> {
    try {
        // API keys are stored as: "prefix_randompart"
        // We find by prefix, then compare hash
        const prefix = rawKey.substring(0, 8)

        const apiKey = await prisma.apiKey.findFirst({
            where: {
                prefix,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            include: { user: { select: { id: true, email: true, name: true, role: true } } },
        })

        if (!apiKey) return null

        const isValid = await bcrypt.compare(rawKey, apiKey.keyHash)
        if (!isValid) return null

        // Update last used timestamp (fire and forget)
        prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
        }).catch(() => { })

        return apiKey.user as AuthUser
    } catch {
        return null
    }
}

/**
 * Require minimum role. Returns 401/403 response or null if OK.
 */
export function requireRole(user: AuthUser | null, minRole: Role): NextResponse | null {
    const levels: Record<Role, number> = {
        VIEWER: 0,
        EDITOR: 1,
        ADMIN: 2,
        SUPER_ADMIN: 3,
    }

    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (levels[user.role] < levels[minRole]) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return null
}

/**
 * Standard API response helpers
 */
export function apiSuccess<T>(data: T, message?: string, extra?: object) {
    return NextResponse.json({ success: true, data, message, ...extra })
}

export function apiError(error: string, status = 400) {
    return NextResponse.json({ success: false, error }, { status })
}

export function apiPaginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
) {
    return NextResponse.json({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    })
}
