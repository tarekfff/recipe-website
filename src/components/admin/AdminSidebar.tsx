'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
    LayoutDashboard, UtensilsCrossed, FolderOpen, Users, MessageSquare,
    Search, Mail, Settings, Key, LogOut, ChefHat, BarChart3
} from 'lucide-react'

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/recipes', label: 'Recipes', icon: UtensilsCrossed },
    { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { href: '/admin/chefs', label: 'Chefs', icon: ChefHat },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/admin/seo', label: 'SEO Center', icon: Search },
    { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col z-40">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-100">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                        <UtensilsCrossed className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Recipe Platform</p>
                        <p className="text-xs text-gray-400">Admin Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${active ? 'active' : 'text-gray-600'}`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-gray-100">
                <Link href="/admin/settings/apikeys"
                    className="sidebar-link text-gray-600 mb-1">
                    <Key className="w-4 h-4" />
                    API Keys
                </Link>
                <Link href="/" target="_blank"
                    className="sidebar-link text-gray-600 mb-1">
                    <BarChart3 className="w-4 h-4" />
                    View Site
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    className="sidebar-link text-red-500 hover:bg-red-50 hover:text-red-600 w-full"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
