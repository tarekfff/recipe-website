import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import {
  Clock, Users, ChefHat, Flame, Star, Timer,
  ChevronRight, CheckCircle2, ArrowLeft, Printer,
  BookmarkPlus, Share2, ThumbsUp
} from 'lucide-react'
import RecipeFeedbackForm from '@/components/recipes/RecipeFeedbackForm'
import RecipeActions from '@/components/recipes/RecipeActions'

type Props = { params: Promise<{ slug: string }> }

// ─── SEO / Metadata ────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const recipe = await prisma.recipe.findUnique({
    where: { slug, deletedAt: null },
    include: { chef: true, category: true, seo: true },
  })
  if (!recipe) return { title: 'Recipe Not Found' }

  // Overrides from SEO table
  const title = recipe.seo?.metaTitle || recipe.title
  const description = recipe.seo?.metaDescription || recipe.description || ""
  const keywords = recipe.seo?.keywords || []

  // Absolute URLs are required for social sharing
  let siteUrl = process.env.DOMAIN_NAME || 'https://nour-gourmand.com'
  if (!siteUrl.startsWith('http')) siteUrl = `https://${siteUrl}`
  
  const imageUrl = recipe.featuredImage
    ? (recipe.featuredImage.startsWith('http') ? recipe.featuredImage : `${siteUrl}${recipe.featuredImage.startsWith('/') ? '' : '/'}${recipe.featuredImage}`)
    : `${siteUrl}/logo.png`

  return {
    metadataBase: new URL(siteUrl),
    title: {
      absolute: title,
    },
    description,
    keywords,
    authors: recipe.chef ? [{ name: recipe.chef.name }] : [],
    openGraph: {
      title,
      description,
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      }],
      url: `${siteUrl}/recipes/${recipe.slug}`,
      siteName: 'NOIR GOURMAND',
      type: 'article',
      publishedTime: recipe.publishedAt?.toISOString(),
      authors: recipe.chef ? [recipe.chef.name] : [],
      section: recipe.category?.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' as const, 'max-video-preview': -1 },
  }
}

export async function generateStaticParams() {
  const recipes = await prisma.recipe.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: { slug: true },
  })
  return recipes.map((r) => ({ slug: r.slug }))
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default async function RecipePage({ params }: Props) {
  const { slug } = await params

  const recipe = await prisma.recipe.findUnique({
    where: { slug, deletedAt: null },
    include: {
      category: true,
      chef: true,
      tags: true,
      images: { orderBy: { order: 'asc' } },
      seo: true,
      feedback: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!recipe || recipe.status !== 'PUBLISHED') notFound()

  // Increment view count asynchronously (fire and forget)
  prisma.recipe.update({
    where: { id: recipe.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => { })

  // Related recipes (same category, excluding current)
  const [related, sidebarFavs, siteSettings] = await Promise.all([
    prisma.recipe.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, categoryId: recipe.categoryId, id: { not: recipe.id } },
      orderBy: { viewCount: 'desc' },
      take: 3,
      select: {
        id: true, slug: true, title: true, featuredImage: true,
        feedback: { where: { status: 'APPROVED' }, select: { rating: true } },
      },
    }),
    prisma.recipe.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, id: { not: recipe.id } },
      orderBy: { viewCount: 'desc' },
      take: 4,
      select: { id: true, slug: true, title: true, featuredImage: true },
    }),
    prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
      select: { siteName: true, logo: true },
    }),
  ])

  const brandName = siteSettings?.siteName || 'Recipe Platform'
  const brandLogo = siteSettings?.logo || '/logo.png'

  // Derived values
  const avgRating = recipe.feedback.length > 0
    ? recipe.feedback.reduce((s: number, f: any) => s + f.rating, 0) / recipe.feedback.length
    : null
  const totalTime = recipe.prepTime + recipe.cookTime
  const ingredients = recipe.ingredients as { name: string; amount: string; unit: string }[]
  const instructions = recipe.instructions as { step: number; text: string; image?: string }[]
  const hasContent = !!recipe.content

  // ── Schema.org JSON-LD (Recipe + BreadcrumbList) ──────────────────────────
  const recipeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.featuredImage ? [recipe.featuredImage] : [],
    author: recipe.chef
      ? { '@type': 'Person', name: recipe.chef.name, url: `${process.env.NEXT_PUBLIC_SITE_URL}/chefs/${recipe.chef.slug}` }
      : undefined,
    datePublished: recipe.publishedAt?.toISOString(),
    dateModified: recipe.updatedAt?.toISOString(),
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${totalTime}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.category.name,
    recipeCuisine: recipe.tags?.find((t: any) => t.slug?.includes('cuisine'))?.name,
    keywords: recipe.tags?.map((t: any) => t.name).join(', '),
    recipeIngredient: ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`.trim()),
    recipeInstructions: instructions.map(s => ({
      '@type': 'HowToStep',
      name: `Step ${s.step}`,
      text: s.text,
      image: s.image,
    })),
    ...(recipe.calories && {
      nutrition: {
        '@type': 'NutritionInformation',
        calories: `${recipe.calories} calories`,
      },
    }),
    ...(avgRating && recipe.feedback.length >= 1 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        ratingCount: recipe.feedback.length,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    video: undefined, // attach if you add video support
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${process.env.NEXT_PUBLIC_SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Recipes', item: `${process.env.NEXT_PUBLIC_SITE_URL}/recipes` },
      { '@type': 'ListItem', position: 3, name: recipe.category.name, item: `${process.env.NEXT_PUBLIC_SITE_URL}/categories/${recipe.category.slug}` },
      { '@type': 'ListItem', position: 4, name: recipe.title, item: `${process.env.NEXT_PUBLIC_SITE_URL}/recipes/${recipe.slug}` },
    ],
  }

  // Difficulty badge styles
  const difficultyStyle: Record<string, { bg: string; color: string; dot: string }> = {
    EASY: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
    MEDIUM: { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
    HARD: { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
  }

  // Star helper
  const Stars = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
    const cls = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'
    return (
      <span className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${cls} ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`}
          />
        ))}
      </span>
    )
  }

  return (
    <>
      {/* ── Structured Data ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <Navbar />

      <div className="rp-root">

        {/* ══════════════════════════════════════════
                    BREADCRUMBS
                ══════════════════════════════════════════ */}
        <div className="rp-header">
          <div className="rp-header-inner">
            {/* Breadcrumb nav */}
            <nav aria-label="Breadcrumb" className="rp-breadcrumb">
              <Link href="/" aria-label="Home">
                <Image src={brandLogo} alt={brandName} width={36} height={36} className="rp-logo" />
              </Link>
              <ChevronRight className="rp-crumb-sep" aria-hidden="true" />
              <Link href="/recipes" className="rp-crumb-link">Recipes</Link>
              <ChevronRight className="rp-crumb-sep" aria-hidden="true" />
              <Link href={`/categories/${recipe.category.slug}`} className="rp-crumb-link">{recipe.category.name}</Link>
              <ChevronRight className="rp-crumb-sep" aria-hidden="true" />
              <span className="rp-crumb-current" aria-current="page">{recipe.title}</span>
            </nav>

            {/* Jump to recipe CTA */}
            <a href="#recipe-card" className="rp-jump-btn">
              ↓ Jump to Recipe
            </a>
          </div>
        </div>

        {/* ══════════════════════════════════════════
                    MAIN CONTENT
                ══════════════════════════════════════════ */}
        <main id="main" className="rp-main">

          {/* Back + category pill */}
          <div className="rp-top-bar">
            <Link href="/recipes" className="rp-back-link">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
            </Link>
            <Link href={`/categories/${recipe.category.slug}`} className="rp-category-pill">
              {recipe.category.name}
            </Link>
            {recipe.tags.slice(0, 2).map((t: any) => (
              <span key={t.slug} className="rp-tag-pill">{t.name}</span>
            ))}
          </div>

          {/* ── TITLE ── */}
          <h1 className="rp-title">{recipe.title}</h1>

          {/* ── DESCRIPTION ── */}
          {recipe.description && (
            <p className="rp-description">{recipe.description}</p>
          )}

          {/* ── META ROW: author / date / rating / share ── */}
          <div className="rp-meta-row">
            <div className="rp-meta-left">
              {recipe.chef && (
                <Link href={`/chefs/${recipe.chef.slug}`} className="rp-author-link">
                  <span className="rp-author-avatar">
                    {recipe.chef.avatar
                      ? <img src={recipe.chef.avatar} alt={recipe.chef.name} />
                      : <ChefHat className="w-4 h-4" aria-hidden="true" />}
                  </span>
                  <span className="rp-author-name">By {recipe.chef.name}</span>
                </Link>
              )}
              {recipe.publishedAt && (
                <time dateTime={recipe.publishedAt.toISOString()} className="rp-pub-date">
                  {new Date(recipe.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </time>
              )}
              {avgRating && (
                <span className="rp-rating-inline">
                  <Stars rating={avgRating} />
                  <span className="rp-rating-text">{avgRating.toFixed(1)} ({recipe.feedback.length})</span>
                </span>
              )}
            </div>
            {/* Quick action buttons */}
            <RecipeActions recipeTitle={recipe.title} recipeSlug={recipe.slug} />
          </div>

          {/* ── HERO IMAGE ── */}
          {recipe.featuredImage && (
            <figure className="rp-hero-wrap">
              <Image
                src={recipe.featuredImage}
                alt={recipe.title}
                fill
                className="rp-hero-img"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1140px"
              />
            </figure>
          )}

          {/* ── QUICK STATS BAR ── */}
          <div className="rp-stats-bar" role="region" aria-label="Recipe summary">
            {[
              { icon: <Clock className="w-5 h-5" aria-hidden="true" />, label: 'Prep Time', value: `${recipe.prepTime} min` },
              { icon: <Flame className="w-5 h-5" aria-hidden="true" />, label: 'Cook Time', value: `${recipe.cookTime} min` },
              { icon: <Timer className="w-5 h-5" aria-hidden="true" />, label: 'Total Time', value: `${totalTime} min` },
              { icon: <Users className="w-5 h-5" aria-hidden="true" />, label: 'Servings', value: `${recipe.servings} people` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="rp-stat-cell">
                <span className="rp-stat-icon">{icon}</span>
                <span className="rp-stat-label">{label}</span>
                <span className="rp-stat-value">{value}</span>
              </div>
            ))}
            {(recipe.difficulty || recipe.calories) && (
              <div className="rp-stat-cell rp-stat-extra">
                {recipe.difficulty && (() => {
                  const s = difficultyStyle[recipe.difficulty] || { bg: '#f5f5f5', color: '#555', dot: '#999' }
                  return (
                    <span className="rp-difficulty-badge" style={{ background: s.bg, color: s.color }}>
                      <span className="rp-difficulty-dot" style={{ background: s.dot }} aria-hidden="true" />
                      {recipe.difficulty}
                    </span>
                  )
                })()}
                {recipe.calories && (
                  <span className="rp-calories">
                    <Flame className="w-4 h-4" aria-hidden="true" />
                    <strong>{recipe.calories}</strong> kcal / serving
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── TWO COLUMN: main + sidebar ── */}
          <div className="rp-layout">

            {/* ────── LEFT COLUMN ────── */}
            <div className="rp-content-col">

              {/* Blog / intro content from CMS */}
              {hasContent && (
                <div className="recipe-content" dangerouslySetInnerHTML={{ __html: recipe.content! }} />
              )}

              {/* Extra images gallery */}
              {recipe.images.length > 0 && (
                <div className="rp-gallery" role="list" aria-label="Recipe photos">
                  {recipe.images.slice(0, 4).map((img: any) => (
                    <div key={img.id} className="rp-gallery-item" role="listitem">
                      <Image src={img.url} alt={img.alt || recipe.title} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* ── CHEF CARD (MAIN) ── */}
              {recipe.chef && (
                <div className="rp-chef-main">
                  <div className="rp-chef-main-avatar">
                    {recipe.chef.avatar
                      ? <img src={recipe.chef.avatar} alt={recipe.chef.name} />
                      : <div className="w-full h-full bg-[#f1efe9] flex items-center justify-center text-4xl">👨‍🍳</div>}
                  </div>
                  <div className="rp-chef-main-content">
                    <p className="rp-chef-main-eyebrow">The Chef Behind the Dish</p>
                    <h2 className="rp-chef-main-name">{recipe.chef.name}</h2>
                    {recipe.chef.bio && (
                      <p className="rp-chef-main-bio">{recipe.chef.bio}</p>
                    )}
                    <Link href={`/chefs/${recipe.chef.slug}`} className="rp-chef-main-btn">
                      More Recipes by {recipe.chef.name.split(' ')[0]} →
                    </Link>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════
                                RECIPE CARD  (WP Recipe Maker equiv.)
                            ═══════════════════════════════════════ */}
              <article id="recipe-card" className="rp-card" aria-label="Recipe card">
                {/* Card header */}
                <header className="rp-card-header">
                  <div className="rp-card-header-inner">
                    <div>
                      <p className="rp-card-eyebrow">Recipe</p>
                      <h2 className="rp-card-title">{recipe.title}</h2>
                      <p className="rp-card-subtitle">{recipe.category.name}</p>
                    </div>
                    <dl className="rp-card-meta">
                      <div><dt>Prep</dt><dd>{recipe.prepTime} min</dd></div>
                      <div><dt>Cook</dt><dd>{recipe.cookTime} min</dd></div>
                      <div><dt>Serves</dt><dd>{recipe.servings}</dd></div>
                      {recipe.difficulty && (
                        <div><dt>Level</dt><dd>{recipe.difficulty}</dd></div>
                      )}
                    </dl>
                  </div>
                  {/* Print + share inside card */}
                  <div className="rp-card-actions">
                    <a href={`/recipes/${recipe.slug}/print`} className="rp-card-action-btn" target="_blank" rel="noopener noreferrer" aria-label="Print recipe">
                      <Printer className="w-3.5 h-3.5" aria-hidden="true" /> Print
                    </a>
                  </div>
                </header>

                <div className="rp-card-body">
                  {/* ── Ingredients ── */}
                  <section aria-labelledby="ingredients-heading">
                    <h3 id="ingredients-heading" className="rp-card-section-title">
                      <span className="rp-card-section-num" aria-hidden="true">1</span>
                      Ingredients
                      <span className="rp-servings-note">— {recipe.servings} servings</span>
                    </h3>
                    <ul className="rp-ingredients-list" role="list">
                      {ingredients.map((ing, i) => (
                        <li key={i} className="rp-ingredient-item">
                          <CheckCircle2 className="rp-check-icon" aria-hidden="true" />
                          <span>
                            <strong>{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</strong>
                            {' '}{ing.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <hr className="rp-card-divider" aria-hidden="true" />

                  {/* ── Instructions ── */}
                  <section aria-labelledby="instructions-heading">
                    <h3 id="instructions-heading" className="rp-card-section-title">
                      <span className="rp-card-section-num" aria-hidden="true">2</span>
                      Directions
                    </h3>
                    <ol className="rp-steps-list" role="list">
                      {instructions.map((step) => (
                        <li key={step.step} className="rp-step-item">
                          <span className="rp-step-num" aria-label={`Step ${step.step}`}>{step.step}</span>
                          <div className="rp-step-body">
                            <p>{step.text}</p>
                            {step.image && (
                              <figure className="rp-step-img-wrap">
                                <Image src={step.image} alt={`Step ${step.step} illustration`} fill className="object-cover" />
                              </figure>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>

                  {/* ── Card footer: nutrition summary ── */}
                  <footer className="rp-card-footer">
                    {recipe.calories && (
                      <span><Flame className="w-4 h-4" aria-hidden="true" /> <strong>{recipe.calories}</strong> kcal</span>
                    )}
                    <span><Users className="w-4 h-4" aria-hidden="true" /> <strong>{recipe.servings}</strong> servings</span>
                    <span><Timer className="w-4 h-4" aria-hidden="true" /> <strong>{totalTime}</strong> min total</span>
                    {recipe.difficulty && (() => {
                      const s = difficultyStyle[recipe.difficulty] || { bg: '#f5f5f5', color: '#555', dot: '#999' }
                      return (
                        <span className="rp-difficulty-badge" style={{ background: s.bg, color: s.color }}>
                          <span className="rp-difficulty-dot" style={{ background: s.dot }} aria-hidden="true" />
                          {recipe.difficulty}
                        </span>
                      )
                    })()}
                  </footer>
                </div>
              </article>


              {/* ── REVIEWS ── */}
              <section className="rp-reviews" aria-labelledby="reviews-heading">
                {recipe.feedback.length > 0 && (
                  <>
                    <div className="rp-reviews-header">
                      <h2 id="reviews-heading" className="rp-section-title">
                        Reviews
                        <span className="rp-reviews-count">({recipe.feedback.length})</span>
                      </h2>
                    {avgRating && (
                      <div className="rp-reviews-avg">
                        <Stars rating={avgRating} size="md" />
                        <strong>{avgRating.toFixed(1)}</strong>
                      </div>
                    )}
                  </div>
                  <div className="rp-reviews-list" role="list">
                    {recipe.feedback.slice(0, 5).map((r: any) => (
                      <article key={r.id} className="rp-review-card" role="listitem">
                        <header className="rp-review-header">
                          <div>
                            <p className="rp-reviewer-name">{r.name}</p>
                            <time dateTime={r.createdAt.toISOString()} className="rp-review-date">
                              {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </time>
                          </div>
                          <Stars rating={r.rating} />
                        </header>
                        <p className="rp-review-comment">{r.comment}</p>
                        <button className="rp-helpful-btn" aria-label="Mark review as helpful">
                          <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" /> Helpful
                        </button>
                      </article>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Feedback Submission Form */}
                <RecipeFeedbackForm recipeId={recipe.id} />
              </section>
            </div>

            {/* ────── SIDEBAR ────── */}
            <aside className="rp-sidebar" aria-label="Recipe sidebar">

              {/* Chef card */}
              {recipe.chef && (
                <div className="rp-chef-card">
                  <p className="rp-sidebar-eyebrow">Recipe By</p>
                  <div className="rp-chef-info">
                    <span className="rp-chef-avatar">
                      {recipe.chef.avatar
                        ? <img src={recipe.chef.avatar} alt={recipe.chef.name} />
                        : <ChefHat className="w-6 h-6" aria-hidden="true" />}
                    </span>
                    <div>
                      <Link href={`/chefs/${recipe.chef.slug}`} className="rp-chef-name">
                        {recipe.chef.name}
                      </Link>
                      {recipe.chef.bio && (
                        <p className="rp-chef-bio">{recipe.chef.bio}</p>
                      )}
                    </div>
                  </div>
                  <Link href={`/chefs/${recipe.chef.slug}`} className="rp-chef-all-btn">
                    View all recipes →
                  </Link>
                </div>
              )}

              {/* Other Reader Favs */}
              {sidebarFavs.length > 0 && (
                <div className="rp-sidebar-favs">
                  <div className="rp-favs-header">
                    <h3 className="rp-favs-title">OTHER READER FAVS</h3>
                  </div>
                  <div className="rp-favs-grid">
                    {sidebarFavs.map(fav => (
                      <Link key={fav.id} href={`/recipes/${fav.slug}`} className="rp-fav-card group">
                        <div className="rp-fav-img-wrap">
                          {fav.featuredImage ? (
                            <Image src={fav.featuredImage} alt={fav.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full bg-[#f1efe9] flex items-center justify-center text-xl">🍽️</div>
                          )}
                        </div>
                        <h4 className="rp-fav-card-title group-hover:text-[#7B2D3B] transition-colors line-clamp-3">
                          {fav.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                  <div className="rp-favs-footer"></div>
                </div>
              )}

              {/* Nutrition quick view */}
              {recipe.calories && (
                <div className="rp-nutrition-card" role="region" aria-label="Nutrition information">
                  <h3 className="rp-sidebar-section-title">Nutrition / Serving</h3>
                  <dl className="rp-nutrition-list">
                    <div className="rp-nutrition-row">
                      <dt>Calories</dt>
                      <dd><strong>{recipe.calories}</strong> kcal</dd>
                    </div>
                    <div className="rp-nutrition-row">
                      <dt>Servings</dt>
                      <dd><strong>{recipe.servings}</strong></dd>
                    </div>
                    {recipe.difficulty && (
                      <div className="rp-nutrition-row">
                        <dt>Difficulty</dt>
                        <dd>{(() => {
                          const s = difficultyStyle[recipe.difficulty] || { bg: '#f5f5f5', color: '#555', dot: '#999' }
                          return (
                            <span className="rp-difficulty-badge" style={{ background: s.bg, color: s.color }}>
                              <span className="rp-difficulty-dot" style={{ background: s.dot }} aria-hidden="true" />
                              {recipe.difficulty}
                            </span>
                          )
                        })()}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Tags */}
              {recipe.tags.length > 0 && (
                <div className="rp-tags-card">
                  <h3 className="rp-sidebar-section-title">Tags</h3>
                  <ul className="rp-tags-list" role="list" aria-label="Recipe tags">
                    {recipe.tags.map((t: any) => (
                      <li key={t.slug}>
                        <Link href={`/tags/${t.slug}`} className="rp-tag-link">{t.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick links within page */}
              <nav className="rp-page-nav" aria-label="Page sections">
                <h3 className="rp-sidebar-section-title">On This Page</h3>
                <ul className="rp-page-nav-list">
                  {hasContent && <li><a href="#recipe-content" className="rp-page-nav-link">About this Recipe</a></li>}
                  <li><a href="#recipe-card" className="rp-page-nav-link">Recipe Card</a></li>
                  {!hasContent && <li><a href="#tips" className="rp-page-nav-link">Cooking Tips</a></li>}
                  {recipe.feedback.length > 0 && <li><a href="#reviews" className="rp-page-nav-link">Reviews ({recipe.feedback.length})</a></li>}
                </ul>
              </nav>
            </aside>
          </div>

          {/* ── RELATED RECIPES ── */}
          {related.length > 0 && (
            <section className="rp-related" aria-labelledby="related-heading">
              <div className="rp-related-header">
                <div>
                  <p className="rp-related-eyebrow">More to try</p>
                  <h2 id="related-heading" className="rp-section-title">More {recipe.category.name} Recipes</h2>
                </div>
                <Link href={`/categories/${recipe.category.slug}`} className="rp-view-all-link">
                  View all →
                </Link>
              </div>
              <div className="rp-related-grid" role="list">
                {related.map((r) => {
                  const rAvg = r.feedback.length > 0
                    ? r.feedback.reduce((s: number, f: any) => s + f.rating, 0) / r.feedback.length
                    : null
                  return (
                    <Link key={r.slug} href={`/recipes/${r.slug}`} className="rp-related-card" role="listitem">
                      <div className="rp-related-img-wrap">
                        {r.featuredImage
                          ? <Image src={r.featuredImage} alt={r.title} fill className="object-cover rp-related-img" />
                          : <div className="rp-related-placeholder" aria-hidden="true">🍽️</div>
                        }
                      </div>
                      <div className="rp-related-info">
                        <h3 className="rp-related-title">{r.title}</h3>
                        {rAvg && (
                          <div className="rp-related-rating">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                            <span>{rAvg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </main>

        {/* ══════════════════════════════════════════
                    FOOTER
                ══════════════════════════════════════════ */}
        <footer className="rp-footer" role="contentinfo">
          <div className="rp-footer-inner">
            <div className="rp-footer-brand">
              <Image src={brandLogo} alt={brandName} width={34} height={34} className="rp-footer-logo" />
              <span>{brandName}</span>
            </div>
            <p className="rp-footer-copy">© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
            <nav aria-label="Footer navigation">
              <ul className="rp-footer-links">
                {[
                  { href: '/recipes', label: 'Recipes' },
                  { href: '/categories', label: 'Categories' },
                  { href: '/chefs', label: 'Chefs' },
                  { href: '/privacy', label: 'Privacy' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="rp-footer-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </footer>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
                STYLES — scoped via .rp- prefix + recipe-content class
            ══════════════════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Design Tokens — Noir Gourmand ── */
        :root {
          --cream:       #FAF7F2;
          --cream-deep:  #F0EBE3;
          --cream-border:#E2DDD5;
          --brown-100:   #F0EBE3;
          --brown-200:   #D9CFC2;
          --brown-400:   #A8727D;
          --brown-500:   #7C6E64;
          --brown-600:   #44403C;
          --brown-700:   #2C2926;
          --brown-900:   #1C1917;
          --accent:      #7B2D3B;
          --accent-light:#f5eced;
          --accent-hover:#5A1F2B;
          --green-bg:    #f5f0ea;
          --green-border:#E2DDD5;
          --white:       #ffffff;
          --text-base:   #2C2926;
          --text-muted:  #5C564F;
          --text-faint:  #8A847D;
          --radius-sm:   8px;
          --radius-md:   14px;
          --radius-lg:   20px;
          --radius-xl:   28px;
          --shadow-sm:   0 1px 4px rgba(28,25,23,.05);
          --shadow-md:   0 4px 20px rgba(28,25,23,.08);
          --shadow-lg:   0 8px 40px rgba(28,25,23,.10);
          --font-serif:  'Cormorant Garamond', Georgia, serif;
          --font-body:   'Poppins', system-ui, sans-serif;
          --max-w:       1140px;
        }

        /* ── Root ── */
        .rp-root {
          min-height: 100vh;
          background: var(--cream);
          font-family: var(--font-body);
          color: #2D2727;
          font-size: 17px;
          line-height: 1.75;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ── Header ── */
        .rp-header {
          background: rgba(250,247,242,.92);
          border-bottom: 1px solid var(--cream-border);
        }
        .rp-header-inner {
          max-width: var(--max-w);
          margin: 0 auto;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .rp-logo { border-radius: 10px; }
        .rp-breadcrumb {
          display: flex; align-items: center;
          gap: 8px; min-width: 0; overflow: hidden;
          font-size: 14px;
        }
        .rp-crumb-sep { width: 14px; height: 14px; color: #B8A99A; flex-shrink: 0; }
        .rp-crumb-link {
          color: #7A6E64; font-weight: 500;
          text-decoration: none; flex-shrink: 0;
          transition: color .2s;
        }
        .rp-crumb-link:hover { color: var(--accent); }
        .rp-crumb-current {
          color: #2D2727; font-weight: 600;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rp-jump-btn {
          flex-shrink: 0;
          font-size: 13px; font-weight: 600;
          padding: 10px 24px;
          border-radius: 99px;
          background: var(--accent);
          color: #fff;
          text-decoration: none;
          transition: all .25s ease;
          box-shadow: 0 4px 16px rgba(123,45,59,.25);
          letter-spacing: .03em;
        }
        .rp-jump-btn:hover { background: var(--accent-hover); }

        /* ── Main wrapper ── */
        .rp-main {
          max-width: var(--max-w);
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        /* ── Top bar ── */
        .rp-top-bar {
          display: flex; align-items: center;
          gap: 12px; flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .rp-back-link {
          display: inline-flex; align-items: center;
          gap: 6px; font-size: 14px; font-weight: 600;
          color: #7A6E64; text-decoration: none;
          transition: color .2s;
        }
        .rp-back-link:hover { color: var(--accent); }
        .rp-category-pill {
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .1em;
          color: var(--accent); text-decoration: none;
          padding: 5px 14px;
          background: var(--accent-light);
          border-radius: 99px;
          transition: all .2s;
        }
        .rp-category-pill:hover { background: #e8d5d8; color: var(--accent-hover); }
        .rp-tag-pill {
          font-size: 12px; font-weight: 500;
          color: #5C504A;
          padding: 5px 14px;
          background: #F0EBE3;
          border-radius: 99px;
        }

        /* ── Title & description ── */
        .rp-title {
          font-family: var(--font-serif);
          font-size: clamp(2.4rem, 5.5vw, 3.8rem);
          font-weight: 700;
          line-height: 1.1;
          color: #1A1614;
          margin: 0 0 20px;
          letter-spacing: -.02em;
        }
        .rp-description {
          font-family: var(--font-body);
          font-size: 19px;
          font-weight: 400;
          line-height: 1.75;
          color: #4A413B;
          margin: 0 0 32px;
          max-width: 68ch;
        }

        /* ── Meta row ── */
        .rp-meta-row {
          display: flex; align-items: center;
          justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--cream-border);
        }
        .rp-meta-left {
          display: flex; align-items: center;
          flex-wrap: wrap; gap: 16px;
        }
        .rp-author-link {
          display: flex; align-items: center;
          gap: 10px; text-decoration: none;
        }
        .rp-author-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--cream-deep);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #7A6E64;
          border: 2px solid #EAE6DF;
        }
        .rp-author-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .rp-author-name {
          font-size: 15px; font-weight: 600;
          color: #2D2727;
          transition: color .2s;
        }
        .rp-author-link:hover .rp-author-name { color: var(--accent); }
        .rp-pub-date {
          font-size: 14px; font-weight: 400; color: #8C8279;
        }
        .rp-rating-inline {
          display: flex; align-items: center; gap: 8px;
        }
        .rp-rating-text {
          font-size: 14px; font-weight: 500; color: #5C504A;
        }
        .rp-actions {
          display: flex; gap: 8px;
        }
        .rp-action-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1.5px solid #E2DDD5;
          background: #fff;
          color: #7A6E64;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all .25s ease;
        }
        .rp-action-btn:hover {
          border-color: var(--accent);
          color: #fff;
          background: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(123,45,59,.2);
        }

        /* ── Hero image ── */
        .rp-hero-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 20px;
          overflow: hidden;
          margin: 0 0 36px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
        }
        .rp-hero-img { object-fit: cover; transition: transform 0.5s ease; }
        .rp-hero-wrap:hover .rp-hero-img { transform: scale(1.02); }

        /* ── Stats bar ── */
        .rp-stats-bar {
          display: flex;
          flex-wrap: wrap;
          background: #fff;
          border: 1px solid #E8E3DB;
          border-radius: var(--radius-xl);
          overflow: hidden;
          margin-bottom: 48px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
        }
        .rp-stat-cell {
          flex: 1 1 120px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 24px 16px;
          border-right: 1px solid #F0EBE3;
          text-align: center;
          gap: 6px;
        }
        .rp-stat-cell:last-child { border-right: none; }
        .rp-stat-icon { color: var(--accent); margin-bottom: 4px; opacity: 0.85; }
        .rp-stat-label {
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .1em;
          color: #9C938A;
        }
        .rp-stat-value {
          font-family: var(--font-body);
          font-size: 20px; font-weight: 700;
          color: #1A1614;
          letter-spacing: -0.01em;
        }
        .rp-stat-extra {
          flex-direction: row; gap: 16px;
          background: #FAF7F2;
          flex-basis: 100%;
          border-top: 1px solid #F0EBE3;
          border-right: none;
          justify-content: center;
          padding: 16px;
        }
        .rp-difficulty-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .06em;
          padding: 5px 14px;
          border-radius: 99px;
        }
        .rp-difficulty-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .rp-calories {
          display: flex; align-items: center; gap: 6px;
          font-size: 15px; font-weight: 500; color: #4A413B;
        }

        /* ── Two-column layout ── */
        .rp-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 44px;
          align-items: start;
        }
        @media (max-width: 880px) {
          .rp-layout { grid-template-columns: 1fr; }
        }

        /* ── Gallery ── */
        .rp-gallery {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 44px;
        }
        .rp-gallery-item {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .rp-gallery-item:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .rp-gallery-item img { transition: transform 0.5s ease; }
        .rp-gallery-item:hover img { transform: scale(1.05); }

        /* ══════════════════════
           RECIPE CARD
        ══════════════════════ */
        .rp-card {
          border: 2px solid var(--accent);
          border-radius: var(--radius-xl);
          overflow: hidden;
          margin-bottom: 40px;
          box-shadow: 0 8px 40px rgba(212,99,26,.12);
        }
        .rp-card-header {
          background: linear-gradient(135deg, #3A1520 0%, #5A1F2B 50%, #7B2D3B 100%);
          padding: 32px 36px 28px;
        }
        .rp-card-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 16px;
        }
        .rp-card-eyebrow {
          font-size: 13px; font-weight: 800;
          text-transform: uppercase; letter-spacing: .16em;
          color: #FFD1DC;
          margin-bottom: 8px;
        }
        .rp-card-title {
          font-family: var(--font-serif);
          font-size: 2.4rem; font-weight: 800;
          color: #ffffff; line-height: 1.15;
          margin: 0 0 10px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .rp-card-subtitle {
          font-size: 17px; color: #F8E5D6; margin: 0; font-weight: 500;
          letter-spacing: .02em;
        }
        .rp-card-meta {
          display: grid; gap: 6px;
          text-align: right; flex-shrink: 0;
        }
        .rp-card-meta dt {
          font-size: 14px; color: #FFD1DC; display: inline; font-weight: 500;
        }
        .rp-card-meta dd {
          font-size: 16px; font-weight: 700; color: #ffffff;
          margin: 0; display: inline;
        }
        .rp-card-meta div { white-space: nowrap; }
        .rp-card-meta div dt::after { content: ': '; }
        .rp-card-actions {
          display: flex; gap: 8px;
        }
        .rp-card-action-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 600;
          padding: 6px 14px; border-radius: 99px;
          background: rgba(255,255,255,.1);
          color: rgba(255,255,255,.75);
          text-decoration: none;
          border: 1px solid rgba(255,255,255,.15);
          transition: background .2s;
        }
        .rp-card-action-btn:hover { background: rgba(255,255,255,.18); }
        .rp-card-body {
          background: var(--white);
          padding: 32px;
        }
        .rp-card-section-title {
          font-size: 24px; font-weight: 700;
          color: #2D2727;
          display: flex; align-items: center; gap: 14px;
          margin: 0 0 28px;
          letter-spacing: -0.01em;
        }
        .rp-card-section-num {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          color: #fff;
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(123, 45, 59, 0.2);
        }
        .rp-servings-note {
          font-size: 16px; font-weight: 500;
          color: #8C7B76;
        }
        .rp-ingredients-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 10px;
        }
        .rp-ingredient-item {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 16px 20px;
          border-radius: var(--radius-lg);
          font-size: 20px;
          font-weight: 500;
          line-height: 1.6;
          color: #352E2D;
          background: #FAFAF8;
          border: 1px solid #EAE6DF;
          transition: all .2s ease;
          cursor: pointer;
        }
        .rp-ingredient-item:hover { background: #F4EFE6; border-color: #D6CBB9; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.03); }
        .rp-check-icon {
          width: 22px; height: 22px;
          color: var(--accent); flex-shrink: 0;
          margin-top: 5px;
        }
        .rp-card-divider {
          border: none;
          border-top: 1px solid var(--cream-border);
          margin: 28px 0;
        }
        .rp-steps-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 24px;
        }
        .rp-step-item {
          display: flex; gap: 20px;
          background: #fff;
          padding: 22px;
          border-radius: var(--radius-lg);
          border: 1px solid #EAE6DF;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .rp-step-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        .rp-step-num {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          color: #fff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(123, 45, 59, 0.25);
        }
        .rp-step-body {
          padding-top: 3px;
          font-size: 20px;
          font-weight: 400;
          line-height: 1.7;
          color: #352E2D;
        }
        .rp-step-body p { margin: 0; }
        .rp-step-img-wrap {
          position: relative;
          margin-top: 16px;
          border-radius: 16px;
          overflow: hidden;
          aspect-ratio: 16/9;
          max-width: 100%;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .rp-step-img-wrap img { transition: transform 0.5s ease; }
        .rp-step-img-wrap:hover img { transform: scale(1.03); }
        .rp-card-footer {
          display: flex; flex-wrap: wrap;
          align-items: center; gap: 20px;
          padding-top: 24px;
          margin-top: 28px;
          border-top: 1px solid #EAE6DF;
          font-size: 15px;
          font-weight: 500;
          color: #7A6E64;
        }
        .rp-card-footer span {
          display: flex; align-items: center; gap: 6px;
        }
        .rp-card-footer strong { color: #2D2727; font-weight: 700; }

        /* ── Tips ── */
        .rp-tips-box {
          background: #fdfbf7;
          border: 1px solid var(--accent);
          border-left: 6px solid var(--accent);
          border-radius: var(--radius-lg);
          padding: 32px;
          margin-bottom: 48px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
        }
        .rp-tips-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 16px;
        }
        .rp-tip-item {
          display: flex; align-items: flex-start; gap: 14px;
          font-size: 20px; font-weight: 500; color: #111;
          line-height: 1.6;
        }
        .rp-tip-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }

        /* ── Storage ── */
        .rp-storage { margin-bottom: 40px; }
        .rp-storage-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 16px;
        }
        @media (max-width: 600px) {
          .rp-storage-grid { grid-template-columns: 1fr; }
        }
        .rp-storage-card {
          background: var(--white);
          border: 1px solid var(--cream-border);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        .rp-storage-icon { font-size: 26px; display: block; margin-bottom: 8px; }
        .rp-storage-label {
          font-size: 13px; font-weight: 700;
          color: var(--brown-900); margin: 0 0 5px;
        }
        .rp-storage-detail {
          font-size: 13px; line-height: 1.5;
          color: var(--text-muted); margin: 0;
        }

        /* ── Section titles ── */
        .rp-section-title {
          font-family: var(--font-serif);
          font-size: 1.8rem; font-weight: 700;
          color: #1A1614;
          margin: 0 0 24px;
          line-height: 1.25;
        }

        /* ── Reviews ── */
        .rp-reviews { margin-bottom: 48px; }
        .rp-reviews-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .rp-reviews-count {
          font-size: 1rem; font-weight: 400;
          color: #9C938A;
          margin-left: 8px;
        }
        .rp-reviews-avg {
          display: flex; align-items: center; gap: 10px;
          font-size: 16px; font-weight: 600; color: #2D2727;
        }
        .rp-reviews-list {
          display: flex; flex-direction: column; gap: 16px;
        }
        .rp-review-card {
          background: #fff;
          border: 1px solid #EAE6DF;
          border-radius: var(--radius-lg);
          padding: 24px 26px;
          transition: box-shadow .2s ease;
        }
        .rp-review-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
        .rp-review-header {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .rp-reviewer-name {
          font-size: 16px; font-weight: 700;
          color: #2D2727; margin: 0;
        }
        .rp-review-date {
          font-size: 13px; font-weight: 400; color: #9C938A;
          display: block; margin-top: 3px;
        }
        .rp-review-comment {
          font-size: 17px; line-height: 1.75;
          font-weight: 400;
          color: #4A413B; margin: 0 0 16px;
        }
        .rp-helpful-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600;
          color: #9C938A;
          background: none; border: 1.5px solid #E2DDD5;
          border-radius: 99px; padding: 6px 16px;
          cursor: pointer;
          transition: all .25s ease;
        }
        .rp-helpful-btn:hover { color: #fff; background: var(--accent); border-color: var(--accent); }

        /* ══════════════════════
           SIDEBAR
        ══════════════════════ */
        .rp-sidebar {
          display: flex; flex-direction: column;
          gap: 20px;
          position: sticky; top: 140px;
          height: fit-content;
        }
        .rp-sidebar-eyebrow {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .14em;
          color: var(--accent); margin: 0 0 14px;
        }
        .rp-sidebar-section-title {
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .12em;
          color: #9C938A; margin: 0 0 14px;
        }

        /* Chef card */
        .rp-chef-card {
          background: #fff;
          border: 1px solid #EAE6DF;
          border-radius: var(--radius-lg);
          padding: 22px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          border-top: 3px solid var(--accent);
        }
        .rp-chef-info {
          display: flex; gap: 14px;
          margin-bottom: 16px;
        }
        .rp-chef-avatar {
          width: 60px; height: 60px;
          border-radius: 50%; overflow: hidden; flex-shrink: 0;
          background: #F0EBE3;
          display: flex; align-items: center; justify-content: center;
          color: #7A6E64;
          border: 3px solid #EAE6DF;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .rp-chef-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .rp-chef-name {
          font-family: var(--font-body);
          font-size: 17px; font-weight: 700;
          color: #2D2727; text-decoration: none;
          display: block; margin-bottom: 4px;
          transition: color .2s;
        }
        .rp-chef-name:hover { color: var(--accent); }
        .rp-chef-bio {
          font-size: 14px; line-height: 1.55;
          font-weight: 400;
          color: #6B6058;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden;
          margin: 0;
        }
        .rp-chef-all-btn {
          display: block; width: 100%; text-align: center;
          font-size: 14px; font-weight: 600;
          padding: 10px;
          border-radius: var(--radius-sm);
          background: var(--accent-light);
          color: var(--accent);
          text-decoration: none;
          transition: all .25s ease;
        }
        .rp-chef-all-btn:hover { background: var(--accent); color: #fff; }

        /* Nutrition card */
        .rp-nutrition-card {
          background: #fff;
          border: 1px solid #EAE6DF;
          border-radius: var(--radius-lg);
          padding: 20px 22px;
        }
        .rp-nutrition-list {
          display: flex; flex-direction: column;
          gap: 0; margin: 0; padding: 0;
        }
        .rp-nutrition-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 11px 0;
          border-bottom: 1px solid #F0EBE3;
          font-size: 15px;
        }
        .rp-nutrition-row:last-child { border-bottom: none; }
        .rp-nutrition-row dt { color: #6B6058; font-weight: 500; }
        .rp-nutrition-row dd { margin: 0; color: #2D2727; font-weight: 600; }

        /* Chef Main Card */
        .rp-chef-main {
          background: #fff;
          border-radius: var(--radius-xl);
          padding: 40px;
          margin-bottom: 48px;
          display: flex;
          gap: 32px;
          align-items: center;
          border: 1px solid #EAE6DF;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
        @media (max-width: 640px) {
          .rp-chef-main { flex-direction: column; text-align: center; padding: 30px 20px; gap: 20px; }
        }
        .rp-chef-main-avatar {
          width: 120px; height: 120px;
          border-radius: 50%; overflow: hidden; flex-shrink: 0;
          border: 5px solid #F4EFE6;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          background: #f1efe9;
        }
        .rp-chef-main-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .rp-chef-main-content { flex: 1; }
        .rp-chef-main-eyebrow {
          font-size: 13px; font-weight: 800; text-transform: uppercase; color: var(--accent);
          letter-spacing: .1em; margin-bottom: 8px;
        }
        .rp-chef-main-name {
          font-family: var(--font-serif); font-size: 2.2rem; font-weight: 800; color: #111;
          margin: 0 0 12px;
        }
        .rp-chef-main-bio { font-size: 18px; color: #4A413B; line-height: 1.6; margin: 0 0 20px; }
        .rp-chef-main-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 15px; font-weight: 700; color: var(--accent);
          text-decoration: none; padding: 10px 24px; border: 2px solid var(--accent);
          border-radius: 99px; transition: all .25s ease;
        }
        .rp-chef-main-btn:hover { background: var(--accent); color: #fff; transform: translateY(-2px); }

        /* Tags card */
        .rp-tags-card {
          background: #fff;
          border: 1px solid #EAE6DF;
          border-radius: var(--radius-lg);
          padding: 20px 22px;
        }
        .rp-tags-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .rp-tag-link {
          font-size: 13px; font-weight: 600;
          color: #5C504A;
          background: #F4F0EA;
          padding: 6px 16px;
          border-radius: 99px;
          text-decoration: none;
          transition: all .25s ease;
        }
        .rp-tag-link:hover { background: var(--accent); color: #fff; }

        /* Page nav */
        .rp-page-nav {
          background: var(--white);
          border: 1px solid var(--cream-border);
          border-radius: var(--radius-md);
          padding: 18px 20px;
        }

        /* Sidebar Favs */
        .rp-sidebar-favs {
          margin-top: 10px;
        }
        .rp-favs-header, .rp-favs-footer {
          border-top: 1px solid #7d967e;
          border-bottom: 3px solid #7d967e;
          padding: 12px 0;
          text-align: center;
          margin-bottom: 24px;
        }
        .rp-favs-footer {
          padding: 0;
          height: 4px;
          margin-top: 24px;
          margin-bottom: 0;
        }
        .rp-favs-title {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: #4a3c31;
          margin: 0;
        }
        .rp-favs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 16px;
        }
        .rp-fav-card {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rp-fav-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .rp-fav-img-wrap img { transition: transform 0.5s ease; }
        .rp-fav-card:hover .rp-fav-img-wrap img { transform: scale(1.05); }
        .rp-fav-card-title {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 700;
          line-height: 1.4;
          color: #2D2727;
          margin: 0;
        }
        .rp-page-nav-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 4px;
        }
        .rp-page-nav-link {
          display: block;
          font-size: 14px; font-weight: 500;
          color: #6B6058;
          text-decoration: none;
          padding: 7px 10px;
          border-radius: var(--radius-sm);
          transition: all .2s ease;
        }
        .rp-page-nav-link:hover {
          background: var(--accent-light);
          color: var(--accent);
          padding-left: 14px;
        }

        /* ── Related ── */
        .rp-related {
          margin-top: 60px;
          padding-top: 50px;
          border-top: 1px solid var(--cream-border);
        }
        .rp-related-header {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .rp-related-eyebrow {
          font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: .12em;
          color: var(--accent); margin-bottom: 4px;
        }
        .rp-view-all-link {
          font-size: 13px; font-weight: 700;
          color: var(--accent); text-decoration: none;
          transition: color .2s;
        }
        .rp-view-all-link:hover { color: var(--accent-hover); }
        .rp-related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 640px) {
          .rp-related-grid { grid-template-columns: 1fr; }
        }
        .rp-related-card {
          background: var(--white);
          border: 1px solid var(--cream-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          text-decoration: none;
          transition: transform .25s, box-shadow .25s;
          box-shadow: var(--shadow-sm);
        }
        .rp-related-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .rp-related-img-wrap {
          position: relative;
          aspect-ratio: 3/2;
          background: var(--cream-deep);
          overflow: hidden;
        }
        .rp-related-img { transition: transform .5s ease; }
        .rp-related-card:hover .rp-related-img { transform: scale(1.06); }
        .rp-related-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem;
        }
        .rp-related-info { padding: 18px 20px; }
        .rp-related-title {
          font-family: var(--font-body);
          font-size: 16px; font-weight: 700;
          color: #2D2727;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0 0 8px;
          transition: color .25s;
        }
        .rp-related-card:hover .rp-related-title { color: var(--accent); }
        .rp-related-rating {
          display: flex; align-items: center; gap: 5px;
          font-size: 14px; font-weight: 600; color: #7A6E64;
        }

        /* ── Footer ── */
        .rp-footer {
          background: linear-gradient(160deg, #1A1614 0%, #2D2420 50%, #1A1614 100%);
          color: rgba(255,255,255,0.55);
          padding: 56px 24px;
        }
        .rp-footer-inner {
          max-width: var(--max-w);
          margin: 0 auto;
          display: flex; flex-wrap: wrap;
          align-items: center; justify-content: space-between;
          gap: 20px;
        }
        .rp-footer-brand {
          display: flex; align-items: center; gap: 12px;
          font-size: 16px; font-weight: 600;
          color: #D4A574;
        }
        .rp-footer-logo { border-radius: 10px; opacity: .8; }
        .rp-footer-copy {
          font-size: 14px;
          font-weight: 400;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }
        .rp-footer-links {
          list-style: none; padding: 0; margin: 0;
          display: flex; gap: 24px;
        }
        .rp-footer-link {
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color .25s;
        }
        .rp-footer-link:hover { color: #D4A574; }

        /* ══════════════════════════════════════════════════
           RICH BLOG / CMS CONTENT  (.recipe-content)
        ══════════════════════════════════════════════════ */
        .recipe-content {
          font-family: var(--font-body);
          font-size: 22px; line-height: 1.85;
          font-weight: 400;
          color: #111;
          margin-bottom: 56px;
        }
        .recipe-content > *:first-child { margin-top: 0; }

        .recipe-content h2 {
          font-family: var(--font-serif);
          font-size: 2.2rem; font-weight: 800;
          color: #000;
          margin: 3rem 0 1rem;
          line-height: 1.3;
          padding-left: 20px;
          border-left: 6px solid var(--accent);
        }
        .recipe-content h3 {
          font-family: var(--font-body);
          font-size: 1.6rem; font-weight: 700;
          color: #111;
          margin: 2.5rem 0 .75rem;
        }
        .recipe-content p { margin: 0 0 1.6rem; }

        .recipe-content ul {
          list-style: none; padding: 0; margin: 0 0 1.6rem;
        }
        .recipe-content ul li {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 10px 0;
          border-bottom: 1px solid var(--cream-border);
          font-size: 20px; font-weight: 500;
        }
        .recipe-content ul li:last-child { border-bottom: none; }
        .recipe-content ul li::before {
          content: '';
          display: inline-block; width: 8px; height: 8px;
          background: var(--accent); border-radius: 50%;
          flex-shrink: 0; margin-top: .5em;
        }

        .recipe-content ol {
          list-style: none; counter-reset: rc-steps;
          padding: 0; margin: 0 0 1.4rem;
        }
        .recipe-content ol li {
          display: flex; align-items: flex-start; gap: 14px;
          margin-bottom: 1rem;
          counter-increment: rc-steps;
          font-size: 16px;
        }
        .recipe-content ol li::before {
          content: counter(rc-steps);
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          color: #fff; font-size: 12px; font-weight: 800;
          flex-shrink: 0; margin-top: .1em;
          font-family: var(--font-body);
        }

        .recipe-content strong { font-weight: 700; color: var(--brown-900); }
        .recipe-content em { font-style: italic; color: var(--brown-600); }
        .recipe-content a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
        .recipe-content a:hover { color: var(--accent-hover); }

        .recipe-content img {
          border-radius: 20px;
          width: calc(100% + 40px);
          margin-left: -20px;
          height: auto;
          margin-top: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 36px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05);
          display: block;
          object-fit: cover;
          max-height: 600px;
        }

        .recipe-content blockquote {
          border-left: 4px solid var(--accent);
          padding: 16px 24px;
          background: linear-gradient(135deg, #fff9f4, #fff4e8);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          margin: 2rem 0;
          font-style: italic;
          color: var(--brown-600);
        }
        .recipe-content blockquote p { margin: 0; }

        .recipe-content hr {
          border: none;
          border-top: 2px solid var(--cream-border);
          margin: 2.5rem 0;
        }

        .recipe-content table {
          width: 100%; border-collapse: collapse;
          margin: 1.5rem 0;
          font-family: var(--font-body);
          font-size: 14px;
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .recipe-content table th {
          background: var(--cream-deep);
          padding: 10px 14px;
          text-align: left; font-weight: 700;
          border-bottom: 2px solid var(--cream-border);
          color: var(--brown-900);
        }
        .recipe-content table td {
          padding: 10px 14px;
          border-bottom: 1px solid var(--cream-border);
          color: var(--brown-600);
        }
        .recipe-content table tr:last-child td { border-bottom: none; }

        /* ── Responsive ── */

        /* Tablet */
        @media (max-width: 880px) {
          .rp-layout { grid-template-columns: 1fr; }
          .rp-sidebar { position: static; }
          .rp-related-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .rp-root { font-size: 16px; line-height: 1.7; }
          .rp-main { padding: 20px 14px 48px; }

          /* Header / breadcrumb */
          .rp-header-inner { height: 50px; padding: 0 14px; }
          .rp-breadcrumb { font-size: 12px; gap: 4px; }
          .rp-jump-btn { font-size: 11px; padding: 7px 14px; }

          /* Top bar */
          .rp-top-bar { gap: 8px; margin-bottom: 16px; }
          .rp-back-link { font-size: 13px; }
          .rp-category-pill { font-size: 11px; padding: 4px 10px; }
          .rp-tag-pill { font-size: 11px; padding: 4px 10px; }

          /* Title / description */
          .rp-title { font-size: 2rem; margin-bottom: 14px; }
          .rp-description { font-size: 16px; margin-bottom: 20px; }

          /* Meta row */
          .rp-meta-row { gap: 10px; margin-bottom: 20px; padding-bottom: 16px; }
          .rp-meta-left { gap: 10px; }
          .rp-author-avatar { width: 32px; height: 32px; }
          .rp-author-name { font-size: 14px; }
          .rp-pub-date { font-size: 12px; }
          .rp-rating-text { font-size: 12px; }
          .rp-actions { gap: 6px; }
          .rp-action-btn { width: 34px; height: 34px; }

          /* Hero */
          .rp-hero-wrap { border-radius: 16px; margin-bottom: 20px; aspect-ratio: 16/10; }

          /* Stats bar */
          .rp-stats-bar { flex-direction: column; border-radius: 16px; }
          .rp-stat-cell {
            flex-basis: auto; padding: 16px 14px;
            border-right: none; border-bottom: 1px solid #F0EBE3;
            flex-direction: row; gap: 12px; justify-content: flex-start;
          }
          .rp-stat-cell:last-child { border-bottom: none; }
          .rp-stat-icon { margin-bottom: 0; }
          .rp-stat-label { font-size: 11px; }
          .rp-stat-value { font-size: 17px; }
          .rp-stat-extra { padding: 12px; }

          /* Recipe card */
          .rp-card { border-radius: 16px; margin-bottom: 28px; }
          .rp-card-header { padding: 20px 16px 18px; }
          .rp-card-header-inner { flex-direction: column; gap: 14px; }
          .rp-card-eyebrow { font-size: 11px; }
          .rp-card-title { font-size: 1.6rem; }
          .rp-card-subtitle { font-size: 14px; }
          .rp-card-meta { text-align: left; grid-template-columns: repeat(2, 1fr); gap: 4px; }
          .rp-card-meta dt { font-size: 12px; }
          .rp-card-meta dd { font-size: 14px; }
          .rp-card-body { padding: 18px 14px; }
          .rp-card-section-title { font-size: 20px; gap: 10px; margin-bottom: 20px; }
          .rp-card-section-num { width: 28px; height: 28px; font-size: 13px; }
          .rp-servings-note { font-size: 13px; }

          /* Ingredients */
          .rp-ingredients-list { gap: 6px; }
          .rp-ingredient-item {
            font-size: 16px; padding: 12px 14px; gap: 12px;
            border-radius: 12px;
          }
          .rp-check-icon { width: 18px; height: 18px; margin-top: 3px; }

          /* Steps */
          .rp-steps-list { gap: 16px; }
          .rp-step-item { gap: 14px; padding: 16px 14px; border-radius: 14px; }
          .rp-step-num { width: 34px; height: 34px; font-size: 14px; }
          .rp-step-body { font-size: 16px; line-height: 1.65; }
          .rp-step-img-wrap { max-width: 100%; }

          /* Card footer */
          .rp-card-footer { font-size: 13px; gap: 12px; }

          /* Gallery */
          .rp-gallery { grid-template-columns: 1fr; gap: 8px; }

          /* Reviews */
          .rp-reviews { margin-bottom: 32px; }
          .rp-reviews-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .rp-section-title { font-size: 1.4rem; }
          .rp-review-card { padding: 18px 16px; }
          .rp-reviewer-name { font-size: 14px; }
          .rp-review-comment { font-size: 15px; }
          .rp-helpful-btn { font-size: 12px; padding: 5px 12px; }

          /* Sidebar */
          .rp-sidebar { gap: 16px; }
          .rp-chef-card { padding: 16px; }
          .rp-chef-avatar { width: 44px; height: 44px; }
          .rp-chef-name { font-size: 15px; }
          .rp-chef-bio { font-size: 13px; }
          .rp-nutrition-card { padding: 14px 16px; }
          .rp-nutrition-row { font-size: 14px; padding: 8px 0; }
          .rp-tags-card { padding: 14px 16px; }
          .rp-tag-link { font-size: 12px; padding: 5px 12px; }
          .rp-page-nav { padding: 14px 16px; }

          /* Sidebar Favs */
          .rp-favs-grid { gap: 12px 10px; }
          .rp-fav-card-title { font-size: 12px; }

          /* Related */
          .rp-related { margin-top: 36px; padding-top: 32px; }
          .rp-related-header { flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 16px; }
          .rp-related-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .rp-related-title { font-size: 14px; }
          .rp-related-info { padding: 12px 14px; }
          .rp-related-rating { font-size: 12px; }

          /* Footer */
          .rp-footer { padding: 32px 14px; }
          .rp-footer-inner { flex-direction: column; align-items: center; text-align: center; gap: 12px; }
          .rp-footer-links { flex-wrap: wrap; justify-content: center; gap: 14px; }
          .rp-footer-brand { font-size: 14px; }
          .rp-footer-copy { font-size: 12px; }
          .rp-footer-link { font-size: 13px; }

          /* CMS content */
          .recipe-content { font-size: 17px; line-height: 1.75; margin-bottom: 36px; }
          .recipe-content h2 { font-size: 1.5rem; padding-left: 14px; border-left-width: 4px; }
          .recipe-content h3 { font-size: 1.2rem; }
          .recipe-content ul li { font-size: 16px; gap: 10px; padding: 8px 0; }
          .recipe-content ol li { font-size: 15px; gap: 10px; }
          .recipe-content ol li::before { min-width: 26px; height: 26px; font-size: 11px; }
          .recipe-content img { width: 100%; margin-left: 0; border-radius: 14px; max-height: 400px; }
          .recipe-content blockquote { padding: 12px 16px; font-size: 16px; }
          .recipe-content table { font-size: 13px; }
          .recipe-content table th,
          .recipe-content table td { padding: 8px 10px; }

          /* Tips */
          .rp-tips-box { padding: 20px 16px; }
          .rp-tip-item { font-size: 16px; gap: 10px; }
          .rp-tip-icon { font-size: 18px; }

          /* Storage */
          .rp-storage-grid { grid-template-columns: 1fr; gap: 10px; }
        }

        /* Extra small phones */
        @media (max-width: 380px) {
          .rp-title { font-size: 1.65rem; }
          .rp-card-title { font-size: 1.35rem; }
          .rp-related-grid { grid-template-columns: 1fr; }
          .rp-stat-cell { padding: 12px; }
          .rp-ingredient-item { font-size: 15px; padding: 10px 12px; }
          .rp-step-body { font-size: 15px; }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .rp-related-card, .rp-related-img { transition: none; }
        }
      `}</style>
    </>
  )
}