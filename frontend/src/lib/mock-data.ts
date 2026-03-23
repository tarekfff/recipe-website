// ─── Mock Data for Vercel Frontend Demo ─────────────────────────────────────
// This file replaces all Prisma database calls for public-facing pages.
// Admin panel and API routes are NOT covered by this mock data.

const now = new Date()
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

// ─── Chefs ───────────────────────────────────────────────────────────────────

export const mockChefs = [
    {
        id: 'chef-1',
        slug: 'chef-ahmed',
        name: 'Chef Ahmed',
        bio: 'Passionate chef with 15 years of Middle Eastern cuisine experience. Specializing in traditional recipes passed down through generations.',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop&crop=face',
        social: { instagram: '@chefahmed', youtube: 'ChefAhmedCooks' },
        createdAt: twoWeeksAgo,
        updatedAt: now,
        recipes: [] as any[],
        _count: { recipes: 0 },
    },
    {
        id: 'chef-2',
        slug: 'chef-sara',
        name: 'Chef Sara',
        bio: 'Award-winning pastry chef and food blogger. Known for creating healthy versions of classic desserts and appetizers.',
        avatar: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=200&h=200&fit=crop&crop=face',
        social: { instagram: '@chefsara', youtube: 'SaraBakes' },
        createdAt: twoWeeksAgo,
        updatedAt: now,
        recipes: [] as any[],
        _count: { recipes: 0 },
    },
    {
        id: 'chef-3',
        slug: 'chef-youssef',
        name: 'Chef Youssef',
        bio: 'Executive chef with a passion for grilled meats and bold flavors. Trained in French and Mediterranean cooking techniques.',
        avatar: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=200&h=200&fit=crop&crop=face',
        social: { instagram: '@chefyoussef' },
        createdAt: twoWeeksAgo,
        updatedAt: now,
        recipes: [] as any[],
        _count: { recipes: 0 },
    },
]

// ─── Categories ──────────────────────────────────────────────────────────────

export const mockCategories = [
    {
        id: 'cat-1',
        slug: 'soups',
        name: 'Soups',
        nameAr: 'شوربات',
        description: 'Warm, comforting soups for every season — from hearty stews to light broths.',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
        order: 1,
        createdAt: twoWeeksAgo,
        updatedAt: now,
        recipes: [] as any[],
        _count: { recipes: 0 },
    },
    {
        id: 'cat-2',
        slug: 'appetizers',
        name: 'Appetizers',
        nameAr: 'مقبلات',
        description: 'Delicious starters and small bites to kick off any meal.',
        image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&h=400&fit=crop',
        order: 2,
        createdAt: twoWeeksAgo,
        updatedAt: now,
        recipes: [] as any[],
        _count: { recipes: 0 },
    },
    {
        id: 'cat-3',
        slug: 'main-dishes',
        name: 'Main Dishes',
        nameAr: 'أطباق رئيسية',
        description: 'Hearty main courses from around the world — grilled, roasted, and braised.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
        order: 3,
        createdAt: twoWeeksAgo,
        updatedAt: now,
        recipes: [] as any[],
        _count: { recipes: 0 },
    },
]

// ─── Tags ────────────────────────────────────────────────────────────────────

export const mockTags = [
    { id: 'tag-1', name: 'Healthy', slug: 'healthy', recipes: [] },
    { id: 'tag-2', name: 'Quick & Easy', slug: 'quick-easy', recipes: [] },
    { id: 'tag-3', name: 'Vegetarian', slug: 'vegetarian', recipes: [] },
    { id: 'tag-4', name: 'Spicy', slug: 'spicy', recipes: [] },
    { id: 'tag-5', name: 'Middle Eastern', slug: 'middle-eastern', recipes: [] },
    { id: 'tag-6', name: 'Comfort Food', slug: 'comfort-food', recipes: [] },
    { id: 'tag-7', name: 'Gluten Free', slug: 'gluten-free', recipes: [] },
    { id: 'tag-8', name: 'High Protein', slug: 'high-protein', recipes: [] },
]

// ─── Recipes ─────────────────────────────────────────────────────────────────

export const mockRecipes = [
    {
        id: 'recipe-1',
        slug: 'red-lentil-soup',
        title: 'Red Lentil Soup',
        titleAr: 'شوربة العدس الأحمر',
        description: 'A hearty, velvety red lentil soup spiced with cumin and finished with a squeeze of fresh lemon. Ready in just 40 minutes.',
        descriptionAr: null,
        content: `<h2>The Ultimate Comfort Bowl</h2><p>This red lentil soup is one of those recipes that you'll make once and keep coming back to. It's rich, nourishing, and incredibly simple to prepare. The combination of earthy lentils, aromatic cumin, and fresh lemon creates a harmony of flavors that warms you from the inside out.</p><h2>Why Red Lentils?</h2><p>Red lentils are perfect for soups because they break down quickly, creating a naturally creamy texture without any need for cream or thickeners. They're also packed with protein and fiber, making this soup as nutritious as it is delicious.</p><ul><li>No soaking required — they cook in just 20 minutes</li><li>Rich in plant-based protein (about 18g per cup)</li><li>Naturally gluten-free and vegan</li></ul><h2>Pro Tips</h2><p>For the best flavor, sauté your onions slowly until they're deeply golden. This caramelization adds a sweet depth that makes the whole soup sing. Don't skip the lemon juice at the end — it brightens everything and ties the flavors together.</p>`,
        ingredients: [
            { name: 'Red lentils', amount: '1', unit: 'cup' },
            { name: 'Onion', amount: '1', unit: 'large' },
            { name: 'Cumin', amount: '1', unit: 'tsp' },
            { name: 'Vegetable broth', amount: '4', unit: 'cups' },
            { name: 'Lemon juice', amount: '2', unit: 'tbsp' },
            { name: 'Olive oil', amount: '2', unit: 'tbsp' },
            { name: 'Garlic cloves', amount: '3', unit: '' },
            { name: 'Salt and pepper', amount: '', unit: 'to taste' },
        ],
        instructions: [
            { step: 1, text: 'Heat olive oil in a large pot over medium heat. Sauté the diced onion and garlic until golden and fragrant, about 5 minutes.' },
            { step: 2, text: 'Add cumin and stir for 30 seconds until aromatic.' },
            { step: 3, text: 'Add red lentils and vegetable broth. Bring to a boil, then reduce heat and simmer for 25 minutes until lentils are completely soft.' },
            { step: 4, text: 'Blend partially with an immersion blender for a creamy yet textured consistency.' },
            { step: 5, text: 'Season with salt, pepper, and fresh lemon juice. Serve hot with crusty bread.' },
        ],
        prepTime: 10,
        cookTime: 30,
        servings: 4,
        difficulty: 'EASY' as const,
        calories: 220,
        featuredImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
        videoUrl: null,
        status: 'PUBLISHED' as const,
        viewCount: 1250,
        publishedAt: oneWeekAgo,
        deletedAt: null,
        createdAt: twoWeeksAgo,
        updatedAt: now,
        categoryId: 'cat-1',
        category: { name: 'Soups', slug: 'soups' },
        chefId: 'chef-1',
        chef: mockChefs[0],
        tags: [mockTags[0], mockTags[2], mockTags[4]],
        feedback: [
            { id: 'fb-1', recipeId: 'recipe-1', name: 'Amira', email: 'amira@example.com', rating: 5, comment: 'Absolutely delicious! My family loved it. Will definitely make again.', status: 'APPROVED' as const, createdAt: now },
            { id: 'fb-2', recipeId: 'recipe-1', name: 'Omar', email: 'omar@example.com', rating: 4, comment: 'Great recipe. I added a pinch of turmeric for extra color and it was wonderful.', status: 'APPROVED' as const, createdAt: oneWeekAgo },
        ],
        seo: { id: 'seo-1', recipeId: 'recipe-1', metaTitle: 'Red Lentil Soup — Easy & Healthy Recipe', metaDescription: 'A hearty red lentil soup recipe ready in 40 minutes.', focusKeyword: 'red lentil soup', keywords: ['lentil soup', 'healthy soup', 'vegan soup'], ogImage: null, canonicalUrl: null, noIndex: false, schemaEnabled: true },
        images: [
            { id: 'img-1', recipeId: 'recipe-1', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop', alt: 'Red Lentil Soup bowl', order: 0 },
        ],
    },
    {
        id: 'recipe-2',
        slug: 'classic-hummus',
        title: 'Classic Hummus',
        titleAr: 'حمص كلاسيكي',
        description: 'Creamy, smooth hummus made with chickpeas, tahini, lemon, and garlic. A Middle Eastern staple that\'s perfect for dipping.',
        descriptionAr: null,
        content: `<h2>The Art of Perfect Hummus</h2><p>Making hummus at home is surprisingly simple, but the secret to restaurant-quality smoothness lies in a few key techniques. This recipe produces a silky, light hummus that's far superior to anything you'll find in a store.</p><h2>The Secret Ingredient</h2><p>Ice-cold water is the secret to ultra-smooth hummus. Adding it gradually while blending creates an incredibly light and airy texture that melts on your tongue.</p>`,
        ingredients: [
            { name: 'Chickpeas (cooked)', amount: '2', unit: 'cups' },
            { name: 'Tahini', amount: '1/3', unit: 'cup' },
            { name: 'Lemon juice', amount: '3', unit: 'tbsp' },
            { name: 'Garlic cloves', amount: '2', unit: '' },
            { name: 'Olive oil', amount: '2', unit: 'tbsp' },
            { name: 'Ice-cold water', amount: '3', unit: 'tbsp' },
            { name: 'Salt', amount: '1/2', unit: 'tsp' },
            { name: 'Cumin', amount: '1/2', unit: 'tsp' },
        ],
        instructions: [
            { step: 1, text: 'In a food processor, blend tahini and lemon juice for 1 minute until light and whipped.' },
            { step: 2, text: 'Add garlic, olive oil, salt, and cumin. Blend for another 30 seconds.' },
            { step: 3, text: 'Add half the chickpeas and blend for 1 minute. Scrape down sides.' },
            { step: 4, text: 'Add remaining chickpeas and ice-cold water. Blend for 3–4 minutes until incredibly smooth.' },
            { step: 5, text: 'Serve in a bowl, drizzled with olive oil and a sprinkle of paprika.' },
        ],
        prepTime: 10,
        cookTime: 0,
        servings: 6,
        difficulty: 'EASY' as const,
        calories: 180,
        featuredImage: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&h=600&fit=crop',
        videoUrl: null,
        status: 'PUBLISHED' as const,
        viewCount: 980,
        publishedAt: oneWeekAgo,
        deletedAt: null,
        createdAt: twoWeeksAgo,
        updatedAt: now,
        categoryId: 'cat-2',
        category: { name: 'Appetizers', slug: 'appetizers' },
        chefId: 'chef-1',
        chef: mockChefs[0],
        tags: [mockTags[0], mockTags[2], mockTags[4], mockTags[6]],
        feedback: [
            { id: 'fb-3', recipeId: 'recipe-2', name: 'Layla', email: null, rating: 5, comment: 'The smoothest hummus I\'ve ever made at home! The cold water trick really works.', status: 'APPROVED' as const, createdAt: now },
        ],
        seo: null,
        images: [],
    },
    {
        id: 'recipe-3',
        slug: 'chicken-shawarma',
        title: 'Chicken Shawarma',
        titleAr: 'شاورما دجاج',
        description: 'Juicy, spiced chicken shawarma with a yogurt garlic sauce. Marinated to perfection and grilled for incredible flavor.',
        descriptionAr: null,
        content: `<h2>Street Food at Home</h2><p>Shawarma is one of the most beloved street foods in the Middle East and for good reason. The layers of spiced, marinated meat stacked on a rotating spit and slow-roasted is a thing of beauty. While we can't easily replicate the spit at home, this oven and skillet method comes remarkably close.</p><h2>The Marinade is Everything</h2><p>A great shawarma starts with a great marinade. The combination of yogurt, warm spices, and a touch of acid tenderizes the chicken while infusing it with deep, complex flavors.</p>`,
        ingredients: [
            { name: 'Chicken thighs (boneless)', amount: '1', unit: 'kg' },
            { name: 'Yogurt', amount: '1/2', unit: 'cup' },
            { name: 'Cumin', amount: '2', unit: 'tsp' },
            { name: 'Paprika', amount: '2', unit: 'tsp' },
            { name: 'Turmeric', amount: '1', unit: 'tsp' },
            { name: 'Garlic cloves', amount: '4', unit: '' },
            { name: 'Lemon juice', amount: '2', unit: 'tbsp' },
            { name: 'Olive oil', amount: '3', unit: 'tbsp' },
            { name: 'Salt and pepper', amount: '', unit: 'to taste' },
        ],
        instructions: [
            { step: 1, text: 'Mix yogurt, all spices, minced garlic, lemon juice, and olive oil in a large bowl.' },
            { step: 2, text: 'Add chicken thighs and coat thoroughly. Marinate for at least 2 hours, or overnight for best results.' },
            { step: 3, text: 'Preheat oven to 220°C (425°F). Arrange chicken on a baking sheet.' },
            { step: 4, text: 'Roast for 25–30 minutes until charred and cooked through.' },
            { step: 5, text: 'Slice thinly and serve in warm pita with garlic sauce, pickles, and fresh vegetables.' },
        ],
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        difficulty: 'MEDIUM' as const,
        calories: 380,
        featuredImage: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&h=600&fit=crop',
        videoUrl: null,
        status: 'PUBLISHED' as const,
        viewCount: 2100,
        publishedAt: twoWeeksAgo,
        deletedAt: null,
        createdAt: twoWeeksAgo,
        updatedAt: now,
        categoryId: 'cat-3',
        category: { name: 'Main Dishes', slug: 'main-dishes' },
        chefId: 'chef-3',
        chef: mockChefs[2],
        tags: [mockTags[3], mockTags[4], mockTags[7]],
        feedback: [
            { id: 'fb-4', recipeId: 'recipe-3', name: 'Khalid', email: 'khalid@example.com', rating: 5, comment: 'Best shawarma recipe I have found online. The marinade is perfect!', status: 'APPROVED' as const, createdAt: now },
            { id: 'fb-5', recipeId: 'recipe-3', name: 'Nadia', email: null, rating: 4, comment: 'Really good! I used chicken breast and it was still juicy.', status: 'APPROVED' as const, createdAt: oneWeekAgo },
            { id: 'fb-6', recipeId: 'recipe-3', name: 'Rami', email: null, rating: 5, comment: 'My go-to shawarma recipe now. The yogurt marinade makes it so tender.', status: 'APPROVED' as const, createdAt: twoWeeksAgo },
        ],
        seo: { id: 'seo-3', recipeId: 'recipe-3', metaTitle: 'Chicken Shawarma — Authentic Recipe', metaDescription: 'Juicy chicken shawarma with yogurt marinade and garlic sauce.', focusKeyword: 'chicken shawarma', keywords: ['shawarma', 'chicken', 'middle eastern'], ogImage: null, canonicalUrl: null, noIndex: false, schemaEnabled: true },
        images: [],
    },
    {
        id: 'recipe-4',
        slug: 'tabbouleh-salad',
        title: 'Tabbouleh Salad',
        titleAr: 'سلطة تبولة',
        description: 'Fresh, vibrant tabbouleh salad bursting with parsley, mint, tomatoes, and a bright lemon dressing.',
        descriptionAr: null,
        content: `<h2>A Celebration of Fresh Herbs</h2><p>Tabbouleh is more than just a salad — it's a celebration of fresh ingredients at their peak. The key is using an abundance of flat-leaf parsley (not curly!) and keeping the bulgur wheat as a subtle background texture rather than the main event.</p>`,
        ingredients: [
            { name: 'Flat-leaf parsley (finely chopped)', amount: '3', unit: 'cups' },
            { name: 'Fine bulgur wheat', amount: '1/4', unit: 'cup' },
            { name: 'Tomatoes (diced)', amount: '2', unit: 'medium' },
            { name: 'Fresh mint (chopped)', amount: '1/4', unit: 'cup' },
            { name: 'Green onions (sliced)', amount: '3', unit: '' },
            { name: 'Lemon juice', amount: '1/4', unit: 'cup' },
            { name: 'Olive oil', amount: '1/4', unit: 'cup' },
            { name: 'Salt', amount: '1', unit: 'tsp' },
        ],
        instructions: [
            { step: 1, text: 'Soak bulgur wheat in boiling water for 15 minutes. Drain and squeeze dry.' },
            { step: 2, text: 'In a large bowl, combine parsley, mint, tomatoes, and green onions.' },
            { step: 3, text: 'Add the bulgur and toss gently.' },
            { step: 4, text: 'Whisk together lemon juice, olive oil, and salt. Pour over the salad and toss.' },
            { step: 5, text: 'Let sit for 15 minutes before serving to let the flavors meld.' },
        ],
        prepTime: 20,
        cookTime: 0,
        servings: 4,
        difficulty: 'EASY' as const,
        calories: 120,
        featuredImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
        videoUrl: null,
        status: 'PUBLISHED' as const,
        viewCount: 740,
        publishedAt: oneWeekAgo,
        deletedAt: null,
        createdAt: twoWeeksAgo,
        updatedAt: now,
        categoryId: 'cat-2',
        category: { name: 'Appetizers', slug: 'appetizers' },
        chefId: 'chef-2',
        chef: mockChefs[1],
        tags: [mockTags[0], mockTags[1], mockTags[2], mockTags[6]],
        feedback: [
            { id: 'fb-7', recipeId: 'recipe-4', name: 'Fatima', email: null, rating: 5, comment: 'So fresh and delicious! I make this every week now.', status: 'APPROVED' as const, createdAt: now },
        ],
        seo: null,
        images: [],
    },
    {
        id: 'recipe-5',
        slug: 'lamb-kofta-kebabs',
        title: 'Lamb Kofta Kebabs',
        titleAr: 'كفتة لحم مشوية',
        description: 'Perfectly spiced lamb kofta kebabs, grilled to smoky perfection. Served with warm pita and tahini sauce.',
        descriptionAr: null,
        content: `<h2>The Perfect Grill</h2><p>These lamb kofta kebabs are a showstopper at any barbecue. The secret is in the blend of spices and not overworking the meat — you want it tender, not tough. A touch of grated onion keeps them incredibly moist.</p>`,
        ingredients: [
            { name: 'Ground lamb', amount: '500', unit: 'g' },
            { name: 'Onion (grated)', amount: '1', unit: 'small' },
            { name: 'Parsley (chopped)', amount: '1/4', unit: 'cup' },
            { name: 'Cumin', amount: '1', unit: 'tsp' },
            { name: 'Coriander', amount: '1', unit: 'tsp' },
            { name: 'Paprika', amount: '1/2', unit: 'tsp' },
            { name: 'Cinnamon', amount: '1/4', unit: 'tsp' },
            { name: 'Salt', amount: '1', unit: 'tsp' },
        ],
        instructions: [
            { step: 1, text: 'Combine all ingredients in a bowl and mix gently with your hands. Do not overwork the meat.' },
            { step: 2, text: 'Divide into 8 portions and shape each around a metal skewer into an elongated oval.' },
            { step: 3, text: 'Refrigerate for 30 minutes to firm up.' },
            { step: 4, text: 'Grill over medium-high heat for 3–4 minutes per side until charred and cooked through.' },
            { step: 5, text: 'Serve immediately with warm pita, tahini sauce, and a squeeze of lemon.' },
        ],
        prepTime: 15,
        cookTime: 10,
        servings: 4,
        difficulty: 'MEDIUM' as const,
        calories: 320,
        featuredImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
        videoUrl: null,
        status: 'PUBLISHED' as const,
        viewCount: 1560,
        publishedAt: twoWeeksAgo,
        deletedAt: null,
        createdAt: twoWeeksAgo,
        updatedAt: now,
        categoryId: 'cat-3',
        category: { name: 'Main Dishes', slug: 'main-dishes' },
        chefId: 'chef-3',
        chef: mockChefs[2],
        tags: [mockTags[3], mockTags[4], mockTags[7]],
        feedback: [
            { id: 'fb-8', recipeId: 'recipe-5', name: 'Hassan', email: null, rating: 5, comment: 'The best kofta recipe. The spice blend is perfect.', status: 'APPROVED' as const, createdAt: now },
            { id: 'fb-9', recipeId: 'recipe-5', name: 'Lina', email: null, rating: 4, comment: 'Really tasty! I added a bit of chili flakes for extra kick.', status: 'APPROVED' as const, createdAt: oneWeekAgo },
        ],
        seo: null,
        images: [],
    },
    {
        id: 'recipe-6',
        slug: 'moroccan-harira-soup',
        title: 'Moroccan Harira Soup',
        titleAr: 'حريرة مغربية',
        description: 'A rich, aromatic Moroccan soup with lentils, chickpeas, tomatoes, and warming spices. Traditionally served during Ramadan.',
        descriptionAr: null,
        content: `<h2>A Moroccan Treasure</h2><p>Harira is Morocco's most beloved soup, traditionally served to break the fast during Ramadan. But this incredibly flavorful, hearty soup deserves to be enjoyed year-round. The combination of lentils, chickpeas, and a luscious tomato base creates layers of flavor.</p>`,
        ingredients: [
            { name: 'Green lentils', amount: '1/2', unit: 'cup' },
            { name: 'Chickpeas (cooked)', amount: '1', unit: 'cup' },
            { name: 'Crushed tomatoes', amount: '400', unit: 'g' },
            { name: 'Onion (diced)', amount: '1', unit: 'large' },
            { name: 'Celery stalks (diced)', amount: '2', unit: '' },
            { name: 'Ginger (grated)', amount: '1', unit: 'tsp' },
            { name: 'Cinnamon stick', amount: '1', unit: '' },
            { name: 'Cilantro (chopped)', amount: '1/4', unit: 'cup' },
            { name: 'Flour', amount: '2', unit: 'tbsp' },
            { name: 'Vegetable broth', amount: '6', unit: 'cups' },
        ],
        instructions: [
            { step: 1, text: 'In a large pot, sauté onion and celery in olive oil until softened, about 5 minutes.' },
            { step: 2, text: 'Add ginger, cinnamon stick, and a pinch of saffron. Stir for 1 minute.' },
            { step: 3, text: 'Add crushed tomatoes, lentils, chickpeas, and vegetable broth. Bring to a boil.' },
            { step: 4, text: 'Reduce heat and simmer for 40 minutes until lentils are tender.' },
            { step: 5, text: 'Mix flour with a little water to make a paste, stir into the soup to thicken.' },
            { step: 6, text: 'Stir in fresh cilantro and serve with lemon wedges and crusty bread.' },
        ],
        prepTime: 15,
        cookTime: 45,
        servings: 6,
        difficulty: 'MEDIUM' as const,
        calories: 260,
        featuredImage: 'https://images.unsplash.com/photo-1603105037880-880cd4f76d6a?w=800&h=600&fit=crop',
        videoUrl: null,
        status: 'PUBLISHED' as const,
        viewCount: 890,
        publishedAt: oneWeekAgo,
        deletedAt: null,
        createdAt: twoWeeksAgo,
        updatedAt: now,
        categoryId: 'cat-1',
        category: { name: 'Soups', slug: 'soups' },
        chefId: 'chef-2',
        chef: mockChefs[1],
        tags: [mockTags[0], mockTags[4], mockTags[5]],
        feedback: [
            { id: 'fb-10', recipeId: 'recipe-6', name: 'Yassine', email: null, rating: 5, comment: 'Tastes just like my grandmother used to make. Incredible!', status: 'APPROVED' as const, createdAt: now },
            { id: 'fb-11', recipeId: 'recipe-6', name: 'Samira', email: null, rating: 5, comment: 'Perfect harira recipe. The spice balance is spot on.', status: 'APPROVED' as const, createdAt: oneWeekAgo },
        ],
        seo: null,
        images: [],
    },
]

// ─── Wire up relationships ───────────────────────────────────────────────────

// Assign recipes to categories
mockCategories[0].recipes = mockRecipes.filter(r => r.categoryId === 'cat-1')
mockCategories[1].recipes = mockRecipes.filter(r => r.categoryId === 'cat-2')
mockCategories[2].recipes = mockRecipes.filter(r => r.categoryId === 'cat-3')
mockCategories[0]._count.recipes = mockCategories[0].recipes.length
mockCategories[1]._count.recipes = mockCategories[1].recipes.length
mockCategories[2]._count.recipes = mockCategories[2].recipes.length

// Assign recipes to chefs
mockChefs[0].recipes = mockRecipes.filter(r => r.chefId === 'chef-1')
mockChefs[1].recipes = mockRecipes.filter(r => r.chefId === 'chef-2')
mockChefs[2].recipes = mockRecipes.filter(r => r.chefId === 'chef-3')
mockChefs[0]._count.recipes = mockChefs[0].recipes.length
mockChefs[1]._count.recipes = mockChefs[1].recipes.length
mockChefs[2]._count.recipes = mockChefs[2].recipes.length


// ─── Helper Functions ────────────────────────────────────────────────────────

export function getRecipeBySlug(slug: string) {
    return mockRecipes.find(r => r.slug === slug) || null
}

export function getCategoryBySlug(slug: string) {
    return mockCategories.find(c => c.slug === slug) || null
}

export function getChefBySlug(slug: string) {
    return mockChefs.find(c => c.slug === slug) || null
}

export function getFeaturedRecipes(limit = 6) {
    return [...mockRecipes].sort((a, b) => b.viewCount - a.viewCount).slice(0, limit)
}

export function getRelatedRecipes(recipeId: string, categoryId: string, limit = 3) {
    return mockRecipes
        .filter(r => r.categoryId === categoryId && r.id !== recipeId)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, limit)
}

export function getSidebarFavs(excludeId: string, limit = 4) {
    return mockRecipes
        .filter(r => r.id !== excludeId)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, limit)
}

export function searchRecipes(query: string) {
    const q = query.toLowerCase()
    return mockRecipes.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    )
}

export function filterRecipes({
    category,
    difficulty,
    q,
    page = 1,
    limit = 12,
}: {
    category?: string
    difficulty?: string
    q?: string
    page?: number
    limit?: number
}) {
    let filtered = [...mockRecipes]
    if (category) filtered = filtered.filter(r => r.category.slug === category)
    if (difficulty) filtered = filtered.filter(r => r.difficulty === difficulty)
    if (q) {
        const query = q.toLowerCase()
        filtered = filtered.filter(r =>
            r.title.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query)
        )
    }
    const total = filtered.length
    const start = (page - 1) * limit
    return {
        recipes: filtered.slice(start, start + limit),
        total,
        pages: Math.ceil(total / limit),
    }
}
