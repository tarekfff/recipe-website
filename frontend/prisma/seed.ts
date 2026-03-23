import { prisma } from '../src/lib/db'
import { mockChefs, mockCategories, mockTags, mockRecipes } from '../src/lib/mock-data'

async function main() {
  // --- Insert Chefs ---
  for (const chef of mockChefs) {
    await prisma.chef.upsert({
      where: { id: chef.id },
      update: {},
      create: {
        id: chef.id,
        slug: chef.slug,
        name: chef.name,
        bio: chef.bio,
        avatar: chef.avatar,
        social: chef.social,
        createdAt: chef.createdAt,
        updatedAt: chef.updatedAt,
      },
    })
  }

  // --- Insert Categories ---
  for (const category of mockCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        nameAr: category.nameAr,
        description: category.description,
        image: category.image,
        order: category.order,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    })
  }

  // --- Insert Tags ---
  for (const tag of mockTags) {
    await prisma.tag.upsert({
      where: { id: tag.id },
      update: {},
      create: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      },
    })
  }

  // --- Insert Recipes ---
  for (const recipe of mockRecipes) {
    const createdRecipe = await prisma.recipe.upsert({
      where: { id: recipe.id },
      update: {},
      create: {
        id: recipe.id,
        slug: recipe.slug,
        title: recipe.title,
        titleAr: recipe.titleAr,
        description: recipe.description,
        descriptionAr: recipe.descriptionAr,
        content: recipe.content,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        featuredImage: recipe.featuredImage,
        videoUrl: recipe.videoUrl,
        status: recipe.status,
        viewCount: recipe.viewCount,
        publishedAt: recipe.publishedAt,
        deletedAt: recipe.deletedAt,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
        chefId: recipe.chefId,
        categoryId: recipe.categoryId,
      },
    })

    // --- Tags ---
    for (const tag of recipe.tags) {
      await prisma.recipe.update({
        where: { id: createdRecipe.id },
        data: { tags: { connect: { id: tag.id } } },
      })
    }

    // --- Feedback ---
    for (const fb of recipe.feedback) {
      await prisma.feedback.upsert({
        where: { id: fb.id },
        update: {},
        create: {
          id: fb.id,
          recipeId: recipe.id,
          name: fb.name,
          email: fb.email,
          rating: fb.rating,
          comment: fb.comment,
          status: fb.status,
          createdAt: fb.createdAt,
        },
      })
    }

    // --- Images ---
    for (const img of recipe.images) {
      await prisma.recipeImage.upsert({
        where: { id: img.id },
        update: {},
        create: {
          id: img.id,
          recipeId: recipe.id,
          url: img.url,
          alt: img.alt,
          order: img.order,
        },
      })
    }

    // --- SEO ---
    if (recipe.seo) {
      await prisma.recipeSEO.upsert({
        where: { id: recipe.seo.id },
        update: {},
        create: {
          id: recipe.seo.id,
          recipeId: recipe.id,
          metaTitle: recipe.seo.metaTitle,
          metaDescription: recipe.seo.metaDescription,
          focusKeyword: recipe.seo.focusKeyword,
          keywords: recipe.seo.keywords,
          ogImage: recipe.seo.ogImage,
          canonicalUrl: recipe.seo.canonicalUrl,
          noIndex: recipe.seo.noIndex,
          schemaEnabled: recipe.seo.schemaEnabled,
        },
      })
    }
  }

  console.log('✅ Mock data seeded to PostgreSQL!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })