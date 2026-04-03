'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RecipeFeedbackForm({ recipeId }: { recipeId: string }) {
    const [rating, setRating] = useState(5)
    const [hover, setHover] = useState(0)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setStatus('loading')

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const comment = formData.get('comment') as string

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeId, name, email, rating, comment }),
            })
            
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to submit feedback')
            }
            
            setStatus('success')
            toast.success('Feedback submitted! It is awaiting review.')
            ;(e.target as HTMLFormElement).reset()
            setRating(5)
        } catch (error: any) {
            console.error('Feedback error:', error)
            toast.error(error.message || 'Failed to submit feedback')
            setStatus('idle')
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-[#f0fdf4] border border-[#dcfce7] text-[#166534] p-6 rounded-[14px] text-center mt-10 shadow-sm transition-all animate-fade-in">
                <h3 className="font-display text-2xl font-bold mb-2">Thank You!</h3>
                <p>Your review has been successfully submitted and is currently awaiting moderation.</p>
                <button onClick={() => setStatus('idle')} className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#dcfce7] hover:bg-[#dcfce7] transition-colors">
                    Write another review
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-[rgba(28,25,23,0.12)] p-7 sm:p-8 rounded-[20px] mt-10 shadow-[0_4px_20px_rgba(28,25,23,0.04)]">
            <h3 className="font-display text-[22px] font-bold text-[#1C1917] mb-6">Leave a Review</h3>
            
            <div className="mb-6">
                <label className="block text-sm font-semibold text-[#44403C] mb-2 uppercase tracking-wide">Your Rating <span className="text-red-500">*</span></label>
                <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button type="button" key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)}
                            className="focus:outline-none transition-transform hover:scale-110 p-0.5">
                            <Star className={`w-7 h-7 ${(hover || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-100'}`} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                    <label className="block text-sm font-semibold text-[#44403C] mb-2" htmlFor="fb-name">Name <span className="text-red-500">*</span></label>
                    <input id="fb-name" name="name" type="text" placeholder="Your name" required disabled={status === 'loading'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#7B2D3B] bg-gray-50/50" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-[#44403C] mb-2" htmlFor="fb-email">Email <span className="font-normal text-gray-400">(not visible)</span></label>
                    <input id="fb-email" name="email" type="email" placeholder="your@email.com" disabled={status === 'loading'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#7B2D3B] bg-gray-50/50" />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-semibold text-[#44403C] mb-2" htmlFor="fb-comment">Review <span className="text-red-500">*</span></label>
                <textarea id="fb-comment" name="comment" required rows={4} minLength={5} disabled={status === 'loading'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#7B2D3B] resize-none bg-gray-50/50"
                    placeholder="What did you think of this recipe? Share your variations..."></textarea>
            </div>

            <button type="submit" disabled={status === 'loading'}
                className="px-8 py-3 bg-[#7B2D3B] hover:bg-[#5A1F2B] text-white font-semibold rounded-[12px] disabled:opacity-70 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto mt-2 shadow-lg shadow-[#7B2D3B]/20">
                {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                Submit Review
            </button>
        </form>
    )
}
