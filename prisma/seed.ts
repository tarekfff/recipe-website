import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // ─── Site Settings ─────────────────────────────────────────────────────────
    await prisma.siteSettings.upsert({
        where: { id: 'singleton' },
        update: {},
        create: {
            id: 'singleton',
            siteName: 'Recipe Platform',
            siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            defaultLanguage: 'en',
        },
    })

    // ─── Admin User ────────────────────────────────────────────────────────────
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@recipe.com'
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
        },
    })
    console.log(`✅ Admin user: ${adminEmail}`)

    // ─── Categories ────────────────────────────────────────────────────────────
    const categories = [
        { slug: 'breakfast', name: 'Breakfast', nameAr: 'الإفطار', description: 'Start your day right', order: 1 },
        { slug: 'lunch', name: 'Lunch', nameAr: 'الغداء', description: 'Midday meals', order: 2 },
        { slug: 'dinner', name: 'Dinner', nameAr: 'العشاء', description: 'Evening delights', order: 3 },
        { slug: 'desserts', name: 'Desserts', nameAr: 'الحلويات', description: 'Sweet treats', order: 4 },
        { slug: 'soups', name: 'Soups', nameAr: 'الشوربات', description: 'Warm and comforting', order: 5 },
        { slug: 'salads', name: 'Salads', nameAr: 'السلطات', description: 'Fresh and healthy', order: 6 },
    ]

    const createdCategories: Record<string, { id: string }> = {}
    for (const cat of categories) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        })
        createdCategories[cat.slug] = created
    }
    console.log(`✅ ${categories.length} categories created`)

    // ─── Chefs ─────────────────────────────────────────────────────────────────
    const chef = await prisma.chef.upsert({
        where: { slug: 'chef-ahmed' },
        update: {},
        create: {
            slug: 'chef-ahmed',
            name: 'Chef Ahmed',
            bio: 'Passionate chef with 15 years of Middle Eastern cuisine experience.',
            social: { instagram: '@chefAhmed', youtube: 'ChefAhmedCooking' },
        },
    })
    console.log(`✅ Chef: ${chef.name}`)

    // ─── Sample Recipes ────────────────────────────────────────────────────────
    const sampleRecipes = [
        {
            slug: 'classic-hummus',
            title: 'Classic Hummus',
            titleAr: 'حمص كلاسيكي',
            description: 'Creamy homemade hummus with tahini, lemon, and garlic. Perfect as a dip or spread.',
            descriptionAr: 'حمص كريمي محلي الصنع مع الطحينة والليمون والثوم.',
            ingredients: [
                { name: 'Chickpeas', amount: '2', unit: 'cups' },
                { name: 'Tahini', amount: '3', unit: 'tbsp' },
                { name: 'Lemon juice', amount: '3', unit: 'tbsp' },
                { name: 'Garlic', amount: '2', unit: 'cloves' },
                { name: 'Olive oil', amount: '2', unit: 'tbsp' },
                { name: 'Salt', amount: '1', unit: 'tsp' },
            ],
            instructions: [
                { step: 1, text: 'Drain and rinse chickpeas, reserve some liquid.' },
                { step: 2, text: 'Add all ingredients to a food processor.' },
                { step: 3, text: 'Blend until smooth, adding reserved liquid for consistency.' },
                { step: 4, text: 'Adjust seasoning and serve with olive oil drizzle.' },
            ],
            prepTime: 10,
            cookTime: 0,
            servings: 4,
            difficulty: 'EASY' as const,
            calories: 180,
            status: 'PUBLISHED' as const,
            categoryId: createdCategories['salads'].id,
            chefId: chef.id,
            publishedAt: new Date(),
        },
        {
            slug: 'chicken-shawarma',
            title: 'Chicken Shawarma',
            titleAr: 'شاورما الدجاج',
            description: 'Juicy, spiced chicken shawarma with a blend of Middle Eastern spices.',
            descriptionAr: 'شاورما دجاج مع مزيج من البهارات الشرق أوسطية.',
            ingredients: [
                { name: 'Chicken thighs', amount: '1', unit: 'kg' },
                { name: 'Cumin', amount: '1', unit: 'tsp' },
                { name: 'Paprika', amount: '1', unit: 'tsp' },
                { name: 'Turmeric', amount: '0.5', unit: 'tsp' },
                { name: 'Garlic powder', amount: '1', unit: 'tsp' },
                { name: 'Lemon juice', amount: '2', unit: 'tbsp' },
                { name: 'Olive oil', amount: '3', unit: 'tbsp' },
            ],
            instructions: [
                { step: 1, text: 'Mix all spices with olive oil and lemon juice.' },
                { step: 2, text: 'Marinate chicken for at least 2 hours.' },
                { step: 3, text: 'Cook on high heat for 6–8 minutes per side.' },
                { step: 4, text: 'Rest and slice thinly before serving.' },
            ],
            prepTime: 15,
            cookTime: 20,
            servings: 4,
            difficulty: 'MEDIUM' as const,
            calories: 380,
            status: 'PUBLISHED' as const,
            categoryId: createdCategories['lunch'].id,
            chefId: chef.id,
            publishedAt: new Date(),
        },
        {
            slug: 'lentil-soup',
            title: 'Red Lentil Soup',
            titleAr: 'شوربة العدس الأحمر',
            description: 'A warming, nutritious red lentil soup with cumin and lemon.',
            descriptionAr: 'شوربة العدس الأحمر الدافئة والمغذية مع الكمون والليمون.',
            ingredients: [
                { name: 'Red lentils', amount: '1', unit: 'cup' },
                { name: 'Onion', amount: '1', unit: 'large' },
                { name: 'Cumin', amount: '1', unit: 'tsp' },
                { name: 'Vegetable broth', amount: '4', unit: 'cups' },
                { name: 'Lemon juice', amount: '2', unit: 'tbsp' },
            ],
            instructions: [
                { step: 1, text: 'Sauté onion until golden.' },
                { step: 2, text: 'Add lentils, cumin, and broth.' },
                { step: 3, text: 'Simmer 25 minutes until lentils are soft.' },
                { step: 4, text: 'Blend partially, finish with lemon juice.' },
            ],
            prepTime: 10,
            cookTime: 30,
            servings: 4,
            difficulty: 'EASY' as const,
            calories: 220,
            status: 'PUBLISHED' as const,
            categoryId: createdCategories['soups'].id,
            chefId: chef.id,
            publishedAt: new Date(),
        },
    ]

    for (const recipe of sampleRecipes) {
        await prisma.recipe.upsert({
            where: { slug: recipe.slug },
            update: {},
            create: recipe,
        })
    }
    console.log(`✅ ${sampleRecipes.length} sample recipes created`)

    // ─── Sample Feedback ────────────────────────────────────────────────────────
    const hummus = await prisma.recipe.findUnique({ where: { slug: 'classic-hummus' } })
    if (hummus) {
        const existingFeedback = await prisma.feedback.findFirst({ where: { recipeId: hummus.id } })
        if (!existingFeedback) {
            await prisma.feedback.create({
                data: {
                    recipeId: hummus.id,
                    name: 'Sarah M.',
                    email: 'sarah@example.com',
                    rating: 5,
                    comment: 'Absolutely delicious! Made this for a dinner party and everyone loved it.',
                    status: 'APPROVED',
                },
            })
        }
    }

    // ─── Newsletter Subscriber ──────────────────────────────────────────────────
    await prisma.newsletter.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: { email: 'demo@example.com', name: 'Demo User', status: 'ACTIVE' },
    })

    console.log('\n🎉 Seed complete!')
    console.log(`   Admin: ${adminEmail} / ${adminPassword}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
