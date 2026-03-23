'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Code2, Eye, CheckCircle2, Upload, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type Ingredient = { name: string; amount: string; unit: string }
type Instruction = { step: number; text: string }

type Props = {
    categories: { id: string; name: string }[]
    chefs: { id: string; name: string }[]
    recipe?: {
        id: string; title: string; description: string; content: string | null
        featuredImage: string | null; difficulty: string
        prepTime: number; cookTime: number; servings: number; calories: number | null
        categoryId: string; chefId: string | null; slug: string
        ingredients: Ingredient[]; instructions: Instruction[]
        seo?: { metaTitle: string | null; metaDescription: string | null; focusKeyword: string | null } | null
    }
}

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']

export default function RecipeEditor({ categories, chefs, recipe }: Props) {
    const router = useRouter()
    const isEdit = !!recipe

    const [title, setTitle] = useState(recipe?.title || '')
    const [description, setDescription] = useState(recipe?.description || '')
    const [content, setContent] = useState(recipe?.content || '')
    const [contentTab, setContentTab] = useState<'html' | 'preview'>('html')
    const [featuredImage, setFeaturedImage] = useState(recipe?.featuredImage || '')
    const [difficulty, setDifficulty] = useState(recipe?.difficulty || 'EASY')
    const [prepTime, setPrepTime] = useState(String(recipe?.prepTime || 15))
    const [cookTime, setCookTime] = useState(String(recipe?.cookTime || 30))
    const [servings, setServings] = useState(String(recipe?.servings || 4))
    const [calories, setCalories] = useState(String(recipe?.calories || ''))
    const [categoryId, setCategoryId] = useState(recipe?.categoryId || '')
    const [chefId, setChefId] = useState(recipe?.chefId || '')

    const [ingredients, setIngredients] = useState<Ingredient[]>(
        recipe?.ingredients || [{ name: '', amount: '', unit: '' }]
    )
    const [instructions, setInstructions] = useState<Instruction[]>(
        recipe?.instructions || [{ step: 1, text: '' }]
    )

    const [metaTitle, setMetaTitle] = useState(recipe?.seo?.metaTitle || '')
    const [metaDescription, setMetaDescription] = useState(recipe?.seo?.metaDescription || '')
    const [focusKeyword, setFocusKeyword] = useState(recipe?.seo?.focusKeyword || '')

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    // ─── Ingredients ──────────────────────────────────────────────────────────
    function addIngredient() { setIngredients(p => [...p, { name: '', amount: '', unit: '' }]) }
    function removeIngredient(i: number) { setIngredients(p => p.filter((_, idx) => idx !== i)) }
    function updateIngredient(i: number, field: keyof Ingredient, value: string) {
        setIngredients(p => p.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
    }

    // ─── Instructions ─────────────────────────────────────────────────────────
    function addStep() { setInstructions(p => [...p, { step: p.length + 1, text: '' }]) }
    function removeStep(i: number) {
        setInstructions(p => p.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, step: idx + 1 })))
    }
    function updateStep(i: number, text: string) {
        setInstructions(p => p.map((s, idx) => idx === i ? { ...s, text } : s))
    }
    function moveStep(i: number, dir: -1 | 1) {
        const newSteps = [...instructions]
        const target = i + dir
        if (target < 0 || target >= newSteps.length) return;
        [newSteps[i], newSteps[target]] = [newSteps[target], newSteps[i]]
        setInstructions(newSteps.map((s, idx) => ({ ...s, step: idx + 1 })))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const seo = {
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            focusKeyword: focusKeyword || null,
        }

        const body = {
            title, description, content: content || null, featuredImage,
            difficulty, prepTime: parseInt(prepTime), cookTime: parseInt(cookTime),
            servings: parseInt(servings), calories: calories ? parseInt(calories) : null,
            categoryId, chefId: chefId || null, ingredients, instructions,
            seo,
        }

        try {
            const res = isEdit
                ? await fetch(`/api/recipes/${recipe.slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                : await fetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

            const data = await res.json()
            setLoading(false)

            if (!data.success) {
                toast.error(data.error || data.message || 'Failed to save recipe')
                return
            }

            toast.success(isEdit ? 'Recipe updated successfully!' : 'Recipe created successfully!')
            router.push('/admin/recipes')
            router.refresh()
        } catch (err) {
            setLoading(false)
            toast.error('Network error. Please try again.')
        }
    }

    return (
        <div className="p-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-7">
                <Link href="/admin/recipes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                </Link>
                <h1 className="font-display text-2xl font-bold text-gray-900">
                    {isEdit ? 'Edit Recipe' : 'New Recipe'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Basic info */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Basic Info</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Recipe name" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description *</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            placeholder="One or two sentence summary shown under the title..." />
                    </div>

                    {/* Content HTML (AI-generated, like WordPress post body) */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Blog Content <span className="text-gray-400 font-normal">(HTML — paste AI-generated content)</span>
                                </label>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {content.length > 0
                                        ? <span className="text-green-600 font-medium">✓ {content.length.toLocaleString()} characters saved</span>
                                        : 'Empty — the recipe page will show auto-generated sections instead'
                                    }
                                </p>
                            </div>
                            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                                <button type="button" onClick={() => setContentTab('html')}
                                    className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${contentTab === 'html' ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                    <Code2 className="w-3 h-3" /> HTML
                                </button>
                                <button type="button" onClick={() => setContentTab('preview')}
                                    className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${contentTab === 'preview' ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                    <Eye className="w-3 h-3" /> Preview
                                </button>
                            </div>
                        </div>
                        {contentTab === 'html' ? (
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={14}
                                spellCheck={false}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y bg-gray-50"
                                placeholder={`<h2>What is this recipe?</h2>\n<p>Describe the dish here...</p>\n\n<h2>Why You'll Love It</h2>\n<ul>\n  <li>Ready in just X minutes</li>\n  <li>Simple ingredients</li>\n</ul>`}
                            />
                        ) : (
                            <div
                                className="min-h-[200px] border border-gray-200 rounded-lg p-4 bg-white prose prose-sm max-w-none overflow-auto"
                                dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">Nothing to preview yet. Switch to HTML tab and paste your content.</p>' }}
                            />
                        )}
                        <p className="text-xs text-gray-400 mt-1.5">
                            Supports any HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;strong&gt;, &lt;img&gt;, etc.
                            When filled, this replaces the auto-generated sections. Leave empty to keep auto-generated content.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Featured Image URL</label>
                        <div className="flex gap-2">
                            <input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="https://..." />
                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                                <Upload className="w-4 h-4" />
                                {uploading ? 'Uploading...' : 'Upload'}
                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    setUploading(true)
                                    try {
                                        const formData = new FormData()
                                        formData.append('file', file)
                                        const res = await fetch('/api/upload', {
                                            method: 'POST',
                                            body: formData
                                        })
                                        if (res.ok) {
                                            const data = await res.json()
                                            setFeaturedImage(data.url)
                                        } else {
                                            alert('Failed to upload image')
                                        }
                                    } catch (err) {
                                        console.error(err)
                                        alert('Failed to upload image')
                                    } finally {
                                        setUploading(false)
                                    }
                                }} disabled={uploading} />
                            </label>
                        </div>
                        {featuredImage && (
                            <img src={featuredImage} alt="preview" className="mt-2 w-40 h-24 object-cover rounded-lg" />
                        )}
                    </div>
                </div>

                {/* Meta */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-4">Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Chef</label>
                            <select value={chefId} onChange={e => setChefId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                                <option value="">No chef</option>
                                {chefs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prep Time (min)</label>
                            <input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} min={0}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cook Time (min)</label>
                            <input type="number" value={cookTime} onChange={e => setCookTime(e.target.value)} min={0}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Servings</label>
                            <input type="number" value={servings} onChange={e => setServings(e.target.value)} min={1}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Calories (optional)</label>
                            <input type="number" value={calories} onChange={e => setCalories(e.target.value)} min={0}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Ingredients</h2>
                        <button type="button" onClick={addIngredient}
                            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium">
                            <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                    </div>
                    <div className="space-y-2">
                        {ingredients.map((ing, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <input value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)}
                                    className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="1.5" />
                                <input value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)}
                                    className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="cups" />
                                <input value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)}
                                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="Ingredient name" />
                                <button type="button" onClick={() => removeIngredient(i)} disabled={ingredients.length === 1}
                                    className="p-1 text-red-300 hover:text-red-500 disabled:opacity-30 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Amount · Unit · Name (e.g. 1.5 · cups · all-purpose flour)</p>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Instructions</h2>
                        <button type="button" onClick={addStep}
                            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium">
                            <Plus className="w-3.5 h-3.5" /> Add Step
                        </button>
                    </div>
                    <div className="space-y-3">
                        {instructions.map((step, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">
                                    {step.step}
                                </div>
                                <textarea value={step.text} onChange={e => updateStep(i, e.target.value)} rows={2}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                    placeholder={`Step ${step.step}...`} />
                                <div className="flex flex-col gap-1">
                                    <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0}
                                        className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
                                        <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" onClick={() => moveStep(i, 1)} disabled={i === instructions.length - 1}
                                        className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
                                        <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" onClick={() => removeStep(i)} disabled={instructions.length === 1}
                                        className="p-1 text-red-300 hover:text-red-500 disabled:opacity-30 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO Metadata */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-4">SEO Metadata</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Best Red Lentil Soup Recipe..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                            <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                placeholder="A comforting and healthy red lentil soup ready in 30 minutes..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Focus Keyword</label>
                            <input value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="red lentil soup" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pb-8">
                    <Link href="/admin/recipes"
                        className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                        Cancel
                    </Link>
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 bg-brand-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 transition-colors">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? 'Save Changes' : 'Create Recipe'}
                    </button>
                </div>
            </form>
        </div>
    )
}
