'use client'

import { Header } from '@/app/components/Header'
import { CartButton } from '@/app/components/Cart'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-gold-50/30 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <CartButton />
    </div>
  )
} 
