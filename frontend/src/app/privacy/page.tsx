import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import Navbar from '@/components/Navbar'
import HomeFooter from '@/components/HomeFooter'

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Learn how we collect, use, and protect your data.',
}

export default async function PrivacyPage() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: 'singleton' },
        select: { privacyText: true }
    })

    return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-20 flex-grow">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1C1917] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Privacy Policy
                </h1>
                <p className="text-gray-500 mb-10">Last updated: October 2026</p>
                
                {settings?.privacyText ? (
                    <div className="prose prose-lg max-w-none text-[#44403C]" dangerouslySetInnerHTML={{ __html: settings.privacyText }} />
                ) : (
                    <div className="prose prose-lg max-w-none text-[#44403C] space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-[#1C1917] mb-4">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us when you create an account, submit a recipe, 
                            subscribe to our newsletter, or communicate with us. This may include your name, email address, 
                            profile picture, and any culinary content you choose to share.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#1C1917] mb-4">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services. Specifically, we use it to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 text-[#7B2D3B]">
                            <li><span className="text-[#44403C]">Authenticate your account and manage your profile.</span></li>
                            <li><span className="text-[#44403C]">Display your submitted recipes and chef profile publically.</span></li>
                            <li><span className="text-[#44403C]">Send you technical notices, updates, and personalized newsletters.</span></li>
                            <li><span className="text-[#44403C]">Monitor and analyze trends, usage, and activities on our platform.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#1C1917] mb-4">3. Data Security and Sharing</h2>
                        <p>
                            We implement rigorous security measures to protect your personal information. We do not sell your 
                            personal data to third parties. We may share anonymous, aggregated data with analytics providers 
                            (such as Google Analytics) to improve our platform experience.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#1C1917] mb-4">4. Your Data Rights</h2>
                        <p>
                            You have the right to access, update, or delete your personal information at any time. If you wish 
                            to permanently delete your account and all associated culinary data from our servers, please 
                            contact us directly through our Contact page.
                        </p>
                    </section>
                </div>
                )}
            </main>
            <HomeFooter />
        </div>
    )
}
