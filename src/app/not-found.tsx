import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
            <div className="text-center">
                <p className="text-8xl mb-6">🍽️</p>
                <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Page Not Found</h1>
                <p className="text-gray-500 mb-8">This recipe might have been removed or doesn't exist.</p>
                <div className="flex gap-3 justify-center">
                    <Link href="/"
                        className="bg-brand-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-brand-600 transition-colors">
                        Go Home
                    </Link>
                    <Link href="/recipes"
                        className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-50 transition-colors">
                        Browse Recipes
                    </Link>
                </div>
            </div>
        </div>
    )
}
