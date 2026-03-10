import type { Metadata } from 'next'
import CategoryForm from '../CategoryForm'

export const metadata: Metadata = { title: 'New Category' }

export default function NewCategoryPage() {
    return <CategoryForm />
}
