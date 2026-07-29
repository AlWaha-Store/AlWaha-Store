// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'
import { Providers } from './components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'الواحة 🌱 - خضروات وفاكهة طازجة',
  description: 'متجر الواحة لبيع الخضروات والفاكهة الطازجة من قلب الطبيعة',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 
