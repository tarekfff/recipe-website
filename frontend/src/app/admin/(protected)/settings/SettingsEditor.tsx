'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Loader2, Search, Code, FileText } from 'lucide-react'

// Tab definitions
type TabType = 'seo' | 'scripts' | 'ads'

interface SiteSettingsFormData {
    seoTitle: string
    seoDescription: string
    seoKeywords: string
    headerScripts: string
    footerScripts: string
    adsTxt: string
}

export default function SettingsEditor({ initialData }: { initialData: any }) {
    const [activeTab, setActiveTab] = useState<TabType>('seo')
    const [isLoading, setIsLoading] = useState(false)

    // Form states
    const [formData, setFormData] = useState<SiteSettingsFormData>({
        seoTitle: initialData?.seoTitle || '',
        seoDescription: initialData?.seoDescription || '',
        seoKeywords: initialData?.seoKeywords || '',
        headerScripts: initialData?.headerScripts || '',
        footerScripts: initialData?.footerScripts || '',
        adsTxt: initialData?.adsTxt || '',
    })

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to update settings')
            }

            toast.success('Site settings globally updated.')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mt-8 relative">
            {/* Header / Tabs */}
            <div className="border-b border-gray-100 px-6 py-4 flex gap-6">
                <button
                    onClick={() => setActiveTab('seo')}
                    className={`flex items-center gap-2 pb-4 -mb-[17px] border-b-2 font-medium transition-colors ${activeTab === 'seo' ? 'border-[#7B2D3B] text-[#7B2D3B]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                    <Search className="w-4 h-4" /> SEO Metadata
                </button>
                <button
                    onClick={() => setActiveTab('scripts')}
                    className={`flex items-center gap-2 pb-4 -mb-[17px] border-b-2 font-medium transition-colors ${activeTab === 'scripts' ? 'border-[#7B2D3B] text-[#7B2D3B]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                    <Code className="w-4 h-4" /> Tracking Scripts
                </button>
                <button
                    onClick={() => setActiveTab('ads')}
                    className={`flex items-center gap-2 pb-4 -mb-[17px] border-b-2 font-medium transition-colors ${activeTab === 'ads' ? 'border-[#7B2D3B] text-[#7B2D3B]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                    <FileText className="w-4 h-4" /> Ads.txt
                </button>
            </div>

            <div className="p-6 pb-20">
                {/* SEO Tab */}
                {activeTab === 'seo' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default SEO Title</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#7B2D3B]/20 focus:border-[#7B2D3B]"
                                placeholder="Noir Gourmand — Culinary Stories"
                                value={formData.seoTitle}
                                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1.5">Appended to the site title globally if a page lacks its own.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default SEO Description</label>
                            <textarea
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#7B2D3B]/20 focus:border-[#7B2D3B]"
                                placeholder="Discover curated recipes from passionate chefs..."
                                value={formData.seoDescription}
                                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Global Keywords</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#7B2D3B]/20 focus:border-[#7B2D3B]"
                                placeholder="recipes, cooking, food, culinary"
                                value={formData.seoKeywords}
                                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* Scripts Tab */}
                {activeTab === 'scripts' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                            <strong>Warning:</strong> Code entered here is injected directly into your website's source code. Ensure you fully trust any scripts (such as Google Analytics or Meta Pixel) before saving.
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">&lt;head&gt; Scripts</label>
                            <textarea
                                rows={5}
                                className="w-full font-mono text-sm bg-gray-900 text-green-400 border border-gray-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#7B2D3B]/50"
                                placeholder="<!-- Google Tag Manager -->"
                                value={formData.headerScripts}
                                onChange={(e) => setFormData({ ...formData, headerScripts: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1.5">Injected at the bottom of the `&lt;head&gt;` element.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">&lt;body&gt; Scripts (Footer)</label>
                            <textarea
                                rows={5}
                                className="w-full font-mono text-sm bg-gray-900 text-green-400 border border-gray-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#7B2D3B]/50"
                                placeholder="<!-- Chat widget or Analytics -->"
                                value={formData.footerScripts}
                                onChange={(e) => setFormData({ ...formData, footerScripts: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1.5">Injected via `afterInteractive` right before the closing `&lt;/body&gt;` tag.</p>
                        </div>
                    </div>
                )}

                {/* Ads Tab */}
                {activeTab === 'ads' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ads.txt Content</label>
                            <textarea
                                rows={10}
                                className="w-full font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#7B2D3B]/20 focus:border-[#7B2D3B]"
                                placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                                value={formData.adsTxt}
                                onChange={(e) => setFormData({ ...formData, adsTxt: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1.5">The content here is dynamically served when visiting `&lt;your-domain&gt;/ads.txt`.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Footer */}
            <div className="absolute border-t border-gray-100 bg-gray-50/80 backdrop-blur-md px-6 py-4 flex justify-between items-center bottom-0 inset-x-0 rounded-b-xl">
                <span className="text-xs text-gray-400">Settings will apply immediately securely without building.</span>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-[#7B2D3B] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#60232e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Configuration
                </button>
            </div>
        </div>
    )
}
