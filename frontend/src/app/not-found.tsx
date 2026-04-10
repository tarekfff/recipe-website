import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
            <div className="text-center px-4">
                <p className="text-6xl sm:text-8xl mb-4 sm:mb-6">🍽️</p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Page Not Found</h1>
                <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">This recipe might have been removed or doesn't exist.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/"
                        className="bg-brand-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-brand-600 transition-colors text-center">
                        Go Home
                    </Link>
                    <Link href="/recipes"
                        className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-50 transition-colors text-center">
                        Browse Recipes
                    </Link>
                </div>
            </div>
        </div>
    )
}
