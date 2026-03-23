import { prisma } from './src/lib/db'
import bcrypt from 'bcryptjs'

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  
  if (!email || !password) {
    throw new Error('❌ FATAL: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be defined in .env')
  }
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: 'SUPER_ADMIN' },
    create: {
      email,
      name: 'Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })
  
  console.log('✅ Admin user seeded:', user.email)
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
