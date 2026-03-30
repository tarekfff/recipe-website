import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET(
    request: Request,
    { params }: { params: { path: string[] } }
) {
    try {
        const filePath = path.join(process.cwd(), 'public/uploads/recipes', ...params.path)
        
        if (!existsSync(filePath)) {
            return new NextResponse('Not found', { status: 404 })
        }

        const fileBuffer = await readFile(filePath)
        
        // Basic mime type mapping based on simple extension (for logos/recipes)
        const ext = path.extname(filePath).toLowerCase()
        let contentType = 'image/jpeg'
        if (ext === '.png') contentType = 'image/png'
        else if (ext === '.webp') contentType = 'image/webp'
        else if (ext === '.gif') contentType = 'image/gif'
        else if (ext === '.svg') contentType = 'image/svg+xml'

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Error serving uploaded file:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
