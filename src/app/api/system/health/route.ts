import { prisma } from '@/lib/db'
import { apiSuccess, apiError } from '@/lib/api-auth'

// GET /api/system/health — Public health check
export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`
        return apiSuccess({
            status: 'ok',
            db: 'connected',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
        })
    } catch {
        return apiError('Database connection failed', 503)
    }
}
