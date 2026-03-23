import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Search, Globe, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'SEO Center' }
export const dynamic = 'force-dynamic'

export default async function SEOPage() {
    const [totalRecipes, withSeo, noSeo, topViewed] = await Promise.all([
        prisma.recipe.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
        prisma.recipe.count({ where: { status: 'PUBLISHED', deletedAt: null, seo: { isNot: null } } }),
        prisma.recipe.findMany({
            where: { status: 'PUBLISHED', deletedAt: null, seo: null },
            select: { id: true, title: true, slug: true, viewCount: true, category: { select: { name: true } } },
            take: 10,
        }),
        prisma.recipe.findMany({
            where: { status: 'PUBLISHED', deletedAt: null },
            orderBy: { viewCount: 'desc' },
            take: 10,
            select: { id: true, title: true, slug: true, viewCount: true, seo: { select: { focusKeyword: true, metaTitle: true } } },
        }),
    ])

    const seoScore = totalRecipes > 0 ? Math.round((withSeo / totalRecipes) * 100) : 0

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-gray-900">SEO Center</h1>
                <p className="text-gray-500 text-sm">Monitor and improve your recipe SEO</p>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-brand-500" />
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">SEO Coverage</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{seoScore}%</p>
                    <p className="text-xs text-gray-400 mt-1">{withSeo} of {totalRecipes} recipes</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">With SEO</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{withSeo}</p>
                    <p className="text-xs text-gray-400 mt-1">Meta tags set</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Missing SEO</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{noSeo.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Need attention</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Published</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{totalRecipes}</p>
                    <p className="text-xs text-gray-400 mt-1">Live recipes</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Missing SEO */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <h2 className="font-semibold text-gray-800 text-sm">Recipes Missing SEO</h2>
                    </div>
                    {noSeo.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                            <p className="text-sm">All recipes have SEO configured! 🎉</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-50">
                            {noSeo.map((r) => (
                                <li key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{r.title}</p>
                                        <p className="text-xs text-gray-400">{r.category.name} • {r.viewCount} views</p>
                                    </div>
                                    <Link href={`/admin/recipes/${r.slug}/edit`}
                                        className="text-xs text-brand-600 hover:underline font-medium">
                                        Fix SEO →
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Top viewed */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <h2 className="font-semibold text-gray-800 text-sm">Top Performing Recipes</h2>
                    </div>
                    <ul className="divide-y divide-gray-50">
                        {topViewed.map((r, i) => (
                            <li key={r.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50">
                                <span className="w-5 text-center text-xs font-bold text-gray-300">#{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                                    <p className="text-xs text-gray-400">
                                        {r.seo?.focusKeyword ? `🎯 ${r.seo.focusKeyword}` : '⚠ No focus keyword'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-700">{r.viewCount}</p>
                                    <p className="text-xs text-gray-400">views</p>
                                </div>
                                <Link href={`/admin/recipes/${r.slug}/edit`}
                                    className="text-xs text-brand-600 hover:underline font-medium">
                                    Edit →
                                </Link>
                            </li>
                        ))}
                        {topViewed.length === 0 && (
                            <li className="px-5 py-10 text-center text-gray-400 text-sm">No published recipes yet.</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Tip box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-blue-800 mb-1">💡 SEO Tips</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Each recipe gets JSON-LD Recipe structured data automatically</li>
                    <li>Set a focus keyword and ensure it appears in the title and description</li>
                    <li>Meta descriptions should be 150–160 characters</li>
                    <li>Use the sitemap at <code className="bg-white px-1 rounded">/sitemap.xml</code> to submit to Google Search Console</li>
                </ul>
            </div>
        </div>
    )
}
