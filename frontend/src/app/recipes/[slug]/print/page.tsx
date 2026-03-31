import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Clock, Users, ChefHat, Flame, Printer } from 'lucide-react'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const recipe = await prisma.recipe.findUnique({
    where: { slug, deletedAt: null },
    select: { title: true }
  })
  if (!recipe) return { title: 'Not Found' }
  return { title: `Print: ${recipe.title}`, robots: { index: false, follow: false } }
}

export default async function PrintRecipePage({ params }: Props) {
  const { slug } = await params

  const recipe = await prisma.recipe.findUnique({
    where: { slug, deletedAt: null, status: 'PUBLISHED' },
    include: {
      category: true,
      chef: true,
    },
  })

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  const siteName = settings?.siteName || 'Recipe Platform'

  if (!recipe) notFound()

  let ingredients: { name: string; amount: string; unit: string }[] = []
  let instructions: { step: number; text: string; image?: string }[] = []
  try {
    ingredients = typeof recipe.ingredients === 'string' 
      ? JSON.parse(recipe.ingredients) 
      : (recipe.ingredients as any) || []
      
    instructions = typeof recipe.instructions === 'string'
      ? JSON.parse(recipe.instructions)
      : (recipe.instructions as any) || []
  } catch (e) {
    console.error("Error parsing recipe arrays for print page:", e)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans print:p-0 p-8 max-w-4xl mx-auto">
      <style>{`
        @media print {
            @page {
                size: auto; /* Uses printer default without forcing A4, but margins shrink to fit */
                margin: 8mm; /* Shrink standard printer margin from 20mm to 8mm to fit more */
            }
            body { 
                font-size: 11pt !important; 
                line-height: 1.3 !important;
            }
        }
      `}</style>
      
      {/* Print Action Bar (Hidden when actually printing) */}
      <div className="print:hidden mb-8 flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-xl">
        <p className="text-sm text-gray-500 font-medium">Printer-Friendly View</p>
        <div className="flex gap-4">
          <a href={`/recipes/${recipe.slug}`} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black">
            Back to Recipe
          </a>
          {/* We'll use a small client-component wrapper or just an onClick handler via raw JS to trigger print */}
          <button 
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
            formAction={undefined}
          >
            <Printer className="w-4 h-4" />
            <span style={{ cursor: 'pointer' }} dangerouslySetInnerHTML={{ __html: `<span onclick="window.print()">Print Recipe</span>` }} />
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="print-area h-full flex flex-col justify-between">
        <div>
            {/* Header Section */}
            <div className="text-center mb-4">
                <p className="text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-400">{siteName}</p>
                <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {recipe.title}
                </h1>
                {recipe.description && (
                    <p className="text-sm text-gray-700 max-w-2xl mx-auto italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {recipe.description}
                    </p>
                )}
            </div>

            {/* Metadata Grid */}
            <div className="flex justify-center gap-8 mb-6 pb-4 border-b border-black">
                {recipe.prepTime && (
                    <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold">{recipe.prepTime} Prep</span>
                    </div>
                )}
                {recipe.cookTime && (
                    <div className="flex items-center gap-1.5 text-sm">
                        <Flame className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold">{recipe.cookTime} Cook</span>
                    </div>
                )}
                {recipe.servings && (
                    <div className="flex items-center gap-1.5 text-sm">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold">{recipe.servings} Servings</span>
                    </div>
                )}
                {recipe.chef && (
                    <div className="flex items-center gap-1.5 text-sm">
                        <ChefHat className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold">By {recipe.chef.name}</span>
                    </div>
                )}
            </div>

            {/* Desktop Split / Mobile Stack */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-2">
                
                {/* Ingredients */}
                <div className="md:col-span-4 border-r border-gray-200 pr-4">
                    <h2 className="text-lg font-bold mb-3 border-b-2 border-black inline-block pb-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Ingredients
                    </h2>
                    <ul className="space-y-1.5 text-sm leading-tight">
                    {ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="text-black font-serif opacity-40 mt-1">•</span>
                            <span className="leading-relaxed text-gray-900">
                                <strong>{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</strong> {ing.name}
                            </span>
                        </li>
                    ))}
                    </ul>
                </div>

                {/* Instructions */}
                <div className="md:col-span-8">
                    <h2 className="text-lg font-bold mb-3 border-b-2 border-black inline-block pb-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Instructions
                    </h2>
                    <div className="space-y-3">
                        {instructions.map((step, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center font-bold text-[11px] mt-0.5">
                                    {step.step || i + 1}
                                </span>
                                <p className="leading-[1.4] text-gray-900">
                                    {step.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Print Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 font-serif">
            Copyright {new Date().getFullYear()} — Printed strictly from {siteName}
        </div>
      </div>

      {/* Auto-print script */}
      <script dangerouslySetInnerHTML={{ __html: `
        // Automatically open print dialog on load
        window.addEventListener('load', function() {
            setTimeout(function() { window.print(); }, 500);
        });
      `}} />
    </div>
  )
}
