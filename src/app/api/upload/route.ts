import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file received.' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${Date.now()}-${file.name.replaceAll(' ', '_')}`

        // Use the public directory to store the uploaded files
        const uploadDir = path.join(process.cwd(), 'public/uploads/recipes')

        // Ensure the directory exists
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (err) {
            console.error('Error creating directory:', err)
            // Ignore if it already exists
        }

        const filepath = path.join(uploadDir, filename)
        await writeFile(filepath, buffer)

        // Return the public URL for the image
        const publicUrl = `/uploads/recipes/${filename}`

        return NextResponse.json({ url: publicUrl })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: 'Error uploading file.' },
            { status: 500 }
        )
    }
}
