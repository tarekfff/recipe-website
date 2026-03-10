import { mockChefs } from '@/lib/mock-data'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ChefHat, Clock, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
    title: 'Our Chefs',
    description: 'Meet the talented chefs behind our recipes.',
}

export default async function ChefsPage() {
    const chefs = mockChefs

    return (
        <div className="min-h-screen bg-cream">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Our Chefs</h1>
                    <p className="text-gray-500 text-lg">The talented people behind these recipes</p>
                </div>

                {chefs.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No chefs yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {chefs.map((chef) => (
                            <Link key={chef.slug} href={`/chefs/${chef.slug}`}
                                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-sage-100 flex items-center justify-center flex-shrink-0">
                                        {chef.avatar
                                            ? <img src={chef.avatar} alt={chef.name} className="w-full h-full object-cover" />
                                            : <ChefHat className="w-7 h-7 text-sage-400" />
                                        }
                                    </div>
                                    <div>
                                        <h2 className="font-display font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                                            {chef.name}
                                        </h2>
                                        <p className="text-sm text-gray-400">{chef._count.recipes} recipes</p>
                                    </div>
                                </div>
                                {chef.bio && (
                                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{chef.bio}</p>
                                )}
                                <p className="text-xs text-brand-600 font-medium mt-4 group-hover:text-brand-700">
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
