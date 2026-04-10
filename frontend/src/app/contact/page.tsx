import { Metadata } from 'next'
import { Mail, MapPin } from 'lucide-react'
import { prisma } from '@/lib/db'
import Navbar from '@/components/Navbar'
import HomeFooter from '@/components/HomeFooter'

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with the Recipe Platform team.',
}

export default async function ContactPage() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: 'singleton' },
        select: { contactText: true }
    })

    return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-20 flex-grow">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1C1917] mb-3 sm:mb-4 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Contact Us
                </h1>
                <p className="text-center text-gray-500 mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
                    Have a question, feedback, or need support with your chef profile? We'd love to hear from you.
                </p>
                
                {settings?.contactText ? (
                    <div className="prose prose-lg max-w-none text-[#44403C]" dangerouslySetInnerHTML={{ __html: settings.contactText }} />
                ) : (
                    <div className="grid md:grid-cols-2 gap-8 sm:gap-12 bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
                    
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold text-[#1C1917]">Get In Touch</h2>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#F0EBE3] rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-[#7B2D3B]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email</h3>
                                    <p className="text-gray-500 mt-1">support@recipeplatform.com</p>
                                    <p className="text-xs text-gray-400 mt-1">Response time: 24-48 hours</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#F0EBE3] rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-[#7B2D3B]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Headquarters</h3>
                                    <p className="text-gray-500 mt-1">123 Culinary Avenue<br/>Gourmet District, NY 10012</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Placeholder */}
                        <div className="bg-[#FAFAFA] rounded-xl p-6 border border-gray-100">
                            <form className="space-y-4" aria-disabled>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-[#7B2D3B] disabled:bg-gray-50" placeholder="Gordon Ramsay" disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-[#7B2D3B] disabled:bg-gray-50" placeholder="gordon@kitchen.com" disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea rows={4} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-[#7B2D3B] disabled:bg-gray-50" placeholder="How do I..." disabled />
                                </div>
                                <button disabled className="w-full bg-[#7B2D3B] text-white py-2.5 rounded-lg opacity-50 cursor-not-allowed font-medium">
                                    Currently Offline
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <HomeFooter />
        </div>
    )
}
