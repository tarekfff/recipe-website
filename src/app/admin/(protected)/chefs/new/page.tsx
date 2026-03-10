import type { Metadata } from 'next'
import ChefForm from '../ChefForm'

export const metadata: Metadata = { title: 'Add Chef' }

export default function NewChefPage() {
    return <ChefForm />
}
