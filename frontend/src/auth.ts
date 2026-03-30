import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                try {
                    const { email, password } = credentialsSchema.parse(credentials)

                    const adminEmail = process.env.SEED_ADMIN_EMAIL
                    const adminPassword = process.env.SEED_ADMIN_PASSWORD

                    // Check .env admin credentials first
                    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
                        return {
                            id: 'system-admin',
                            email: adminEmail,
                            name: 'System Admin',
                            role: 'SUPER_ADMIN',
                        }
                    }

                    // Otherwise, check database users
                    const user = await prisma.user.findUnique({
                        where: { email },
                    })

                    if (!user) return null

                    const isValid = await bcrypt.compare(password, user.password)
                    if (!isValid) return null

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    }
                } catch {
                    return null
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role
            }
            return token
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ; (session.user as any).role = token.role as string
            }
            return session
        },
    },
    pages: {
        signIn: '/admin/login',
    },
})
