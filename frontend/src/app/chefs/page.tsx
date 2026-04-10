import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ChefHat } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
    title: 'Our Chefs',
    description: 'Meet the talented chefs behind our recipes.',
}

export default async function ChefsPage() {
    const chefs = await prisma.chef.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { recipes: { where: { status: 'PUBLISHED', deletedAt: null } } } },
        },
    })

    return (
        <div className="min-h-screen bg-cream">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Our Chefs</h1>
                    <p className="text-gray-500 text-base sm:text-lg">The talented people behind these recipes</p>
                </div>

                {chefs.length === 0 ? (
                    <div className="text-center py-16 sm:py-20 text-gray-400">
                        <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No chefs yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {chefs.map((chef) => (
                            <Link key={chef.slug} href={`/chefs/${chef.slug}`}
                                className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
                                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-sage-100 flex items-center justify-center flex-shrink-0">
                                        {chef.avatar
                                            ? <img src={chef.avatar} alt={chef.name} className="w-full h-full object-cover" />
                                            : <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-sage-400" />
                                        }
                                    </div>
                                    <div>
                                        <h2 className="font-display font-bold text-sm sm:text-base text-gray-900 group-hover:text-brand-700 transition-colors">
                                            {chef.name}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-gray-400">{chef._count.recipes} recipes</p>
                                    </div>
                                </div>
                                {chef.bio && (
                                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-3 leading-relaxed">{chef.bio}</p>
                                )}
                                <p className="text-xs text-brand-600 font-medium mt-3 sm:mt-4 group-hover:text-brand-700">
                                    View recipes →
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
