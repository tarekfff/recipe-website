'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateSiteSettings(formData: {
    siteName?: string
    logo?: string
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string
    headerScripts?: string
    footerScripts?: string
    adsTxt?: string
    aboutText?: string
    privacyText?: string
    termsText?: string
    contactText?: string
    socialLinks?: any
}) {
    // Verify auth via session (works reliably in Server Actions)
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' }
    }

    let user: { id: string, role: string } | null = null

    if (session.user.id === 'system-admin') {
        user = { id: 'system-admin', role: 'SUPER_ADMIN' }
    } else {
        user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, role: true },
        })
    }

    if (!user || user.role !== 'SUPER_ADMIN') {
        return { success: false, error: 'Forbidden' }
    }

    try {
        // Remove null/undefined values (keep empty strings, they're valid)
        const cleanData = Object.fromEntries(
            Object.entries(formData).filter(([, v]) => v !== null && v !== undefined)
        )

        console.log('[Settings Save] Auth passed, user role:', user.role)
        console.log('[Settings Save] Data to save:', JSON.stringify(cleanData).substring(0, 200))

        const updatedSettings = await prisma.siteSettings.upsert({
            where: { id: 'singleton' },
            create: {
                id: 'singleton',
                ...cleanData,
            },
            update: {
                ...cleanData,
            }
        })

        console.log('[Settings Save] Upsert succeeded, siteName:', updatedSettings.siteName)

        // Revalidate pages that use settings
        revalidatePath('/', 'layout')

        return { success: true, data: updatedSettings }
    } catch (error: any) {
        console.error('Server Action Error (updateSiteSettings):', error)
        return { success: false, error: 'Failed to update settings' }
    }
}
