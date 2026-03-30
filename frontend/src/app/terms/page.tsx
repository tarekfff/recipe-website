import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import Navbar from '@/components/Navbar'
import HomeFooter from '@/components/HomeFooter'

export const metadata: Metadata = {
    title: 'Terms of Use',
    description: 'Read the terms and conditions for using the Recipe Platform.',
}

export default async function TermsPage() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: 'singleton' },
        select: { termsText: true }
    })

    return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-20 flex-grow">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1C1917] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Terms of Use
                </h1>
                <p className="text-gray-500 mb-10">Last updated: October 2026</p>
                
                {settings?.termsText ? (
                    <div className="prose prose-lg max-w-none text-[#44403C]" dangerouslySetInnerHTML={{ __html: settings.termsText }} />
                ) : (
                    <div className="prose prose-lg max-w-none text-[#44403C] space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Acceptance of Terms</h2>
                        <p>
                            By accessing, viewing, or contributing to the Recipe Platform, you agree to be bound by these 
                            Terms of Use. If you disagree with any part of these terms, you may not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#1C1917] mb-4">User Content</h2>
                        <p>
                            Our service allows you to post, link, store, share and otherwise make available culinary recipes, 
                            photos, text, and other material (&quot;Content&quot;). You are completely responsible for the Content 
                            that you post to the service, including its legality, reliability, and appropriateness. 
                        </p>
                        <p className="mt-4">
                            By posting Content to the platform, you grant us the right and license to use, modify, publicly 
                            perform, publicly display, reproduce, and distribute such Content on and through the platform. 
                            You retain any and all of your rights to any Content you submit, post or display.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Prohibited Uses</h2>
                        <p>
                            You may use the platform only for lawful purposes and in accordance with Terms. You agree not to use the platform:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 text-[#7B2D3B]">
                            <li><span className="text-[#44403C]">In any way that violates any applicable national or international law or regulation.</span></li>
                            <li><span className="text-[#44403C]">To scrape, copy, or wholesale download recipes for competitive platforms without permission.</span></li>
                            <li><span className="text-[#44403C]">To upload malicious software, viruses, or any code of a destructive nature.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Disclaimer of Warranties</h2>
                        <p>
                            The recipes and culinary advice provided on this platform are for general informational purposes 
                            only. We make no representations or warranties of any kind regarding the accuracy, completeness, 
                            or safety of the food preparation methods described. Always use your best judgment regarding food 
                            safety, allergies, and dietary restrictions.
                        </p>
                    </section>
                </div>
                )}
            </main>
            <HomeFooter />
        </div>
    )
}
