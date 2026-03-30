import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import Navbar from '@/components/Navbar'
import HomeFooter from '@/components/HomeFooter'

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn more about the Recipe Platform and our culinary mission.',
}

export default async function AboutPage() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: 'singleton' },
        select: { aboutText: true }
    })

    return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-20 flex-grow">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1C1917] mb-8 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                    About Us
                </h1>
                
                {settings?.aboutText ? (
                    <div className="prose prose-lg max-w-none text-[#44403C]" dangerouslySetInnerHTML={{ __html: settings.aboutText }} />
                ) : (
                    <div className="prose prose-lg max-w-none text-[#44403C] space-y-6">
                    <p className="lead text-xl text-[#7B2D3B] font-medium text-center mb-12">
                        Welcome to the Recipe Platform, where culinary passion meets global sharing.
                    </p>
                    
                    <div className="bg-[#F0EBE3]/30 p-8 rounded-2xl mb-10 border border-[#E6D0CA]">
                        <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Our Mission</h2>
                        <p>
                            We believe that cooking is more than just preparing food; it&apos;s an art, a science, and a way to bring people together. 
                            Our mission is to empower home cooks and professional chefs alike to discover, create, and share amazing recipes from 
                            around the world.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 my-12">
                        <div>
                            <h3 className="text-xl font-bold text-[#1C1917] mb-3">For Creators</h3>
                            <p>
                                We provide a beautiful, seamless canvas for chefs to document their culinary journeys. 
                                From detailed ingredient lists to step-by-step instructions and stunning photography, 
                                our platform ensures your recipes look as good as they taste.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#1C1917] mb-3">For Foodies</h3>
                            <p>
                                Discover endless inspiration. Whether you&apos;re looking for a quick weeknight dinner, 
                                a complex baking challenge, or a healthy vegan alternative, our growing community 
                                has something perfectly tailored to your cravings.
                            </p>
                        </div>
                    </div>

                    <p className="mt-10 pt-10 border-t border-gray-200">
                        Join us in building the world&apos;s most vibrant culinary community. Grab your apron, preheat the oven, 
                        and let&apos;s get cooking!
                    </p>
                </div>
                )}
            </main>
            <HomeFooter />
        </div>
    )
}
