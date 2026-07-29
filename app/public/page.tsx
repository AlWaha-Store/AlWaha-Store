'use client'

import { useState, useEffect } from 'react'
import { useUIStore } from '@/app/store/ui'
import { t } from '@/app/lib/translations'
import { supabase } from '@/app/lib/supabase'
import { Product } from '@/app/types'
import { ProductCard, ProductModal } from '@/app/components/Product'
import { Search, Phone, Mail, MapPin } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER, EMAIL } from '@/app/lib/constants'

export default function HomePage() {
  const { language } = useUIStore()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeCategory, setActiveCategory] = useState<'fruits' | 'vegetables' | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = products

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [activeCategory, searchQuery, products])

  const onSaleProducts = products.filter(p => p.isOnSale)
  const fruits = filteredProducts.filter(p => p.category === 'fruits')
  const vegetables = filteredProducts.filter(p => p.category === 'vegetables')

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-green-600 to-green-800 p-8 md:p-12">
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-aref mb-4">
            {t('heroTitle', language)}
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            {t('heroSubtitle', language)}
          </p>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 text-9xl">🍎</div>
          <div className="absolute bottom-0 right-0 text-9xl">🥬</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl">🍊</div>
          <div className="absolute bottom-1/4 left-1/4 text-7xl">🥕</div>
          <div className="absolute top-1/4 right-1/4 text-7xl">🍇</div>
        </div>
      </section>

      {/* Categories */}
      <section className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-6 py-3 rounded-full font-bold transition ${
            activeCategory === 'all'
              ? 'bg-gold text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gold/10'
          }`}
        >
          {t('categories', language)}
        </button>
        <button
          onClick={() => setActiveCategory('fruits')}
          className={`px-6 py-3 rounded-full font-bold transition ${
            activeCategory === 'fruits'
              ? 'bg-gold text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gold/10'
          }`}
        >
          🍎 {t('fruits', language)}
        </button>
        <button
          onClick={() => setActiveCategory('vegetables')}
          className={`px-6 py-3 rounded-full font-bold transition ${
            activeCategory === 'vegetables'
              ? 'bg-gold text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gold/10'
          }`}
        >
          🥬 {t('vegetables', language)}
        </button>
        <button
          onClick={() => scrollToSection('offers')}
          className="px-6 py-3 rounded-full font-bold bg-red-500 text-white hover:bg-red-600 transition"
        >
          🔥 {t('exclusiveOffers', language)}
        </button>
      </section>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder', language)}
          className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
        />
      </div>

      {/* Fruits Section */}
      {fruits.length > 0 && (
        <section id="fruits">
          <h2 className="text-3xl font-aref text-gold dark:text-gold-light mb-6">
            🍎 {t('fruits', language)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {fruits.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPreview={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Vegetables Section */}
      {vegetables.length > 0 && (
        <section id="vegetables">
          <h2 className="text-3xl font-aref text-gold dark:text-gold-light mb-6">
            🥬 {t('vegetables', language)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {vegetables.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPreview={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Offers Section */}
      {onSaleProducts.length > 0 && (
        <section id="offers">
          <h2 className="text-3xl font-aref text-red-500 mb-6">
            🔥 {t('exclusiveOffers', language)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {onSaleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPreview={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg">
        <h2 className="text-2xl font-aref text-center mb-6">تواصل معنا</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href={`https://wa.me/20${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition group"
          >
            <FaWhatsapp className="w-8 h-8 text-green-500 group-hover:scale-110 transition" />
            <span className="text-sm font-medium">واتساب</span>
          </a>
          <a
            href={`tel:${WHATSAPP_NUMBER}`}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition group"
          >
            <Phone className="w-8 h-8 text-blue-500 group-hover:scale-110 transition" />
            <span className="text-sm font-medium">اتصال</span>
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="flex flex-col items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition group"
          >
            <Mail className="w-8 h-8 text-red-500 group-hover:scale-110 transition" />
            <span className="text-sm font-medium">إيميل</span>
          </a>
          <button
            onClick={() => window.open('https://maps.google.com', '_blank')}
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition group"
          >
            <MapPin className="w-8 h-8 text-purple-500 group-hover:scale-110 transition" />
            <span className="text-sm font-medium">الموقع</span>
          </button>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
    } 
