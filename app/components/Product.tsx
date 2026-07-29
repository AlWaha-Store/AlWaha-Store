'use client'

import { useState } from 'react'
import { useCartStore } from '@/app/store/cart'
import { useUIStore } from '@/app/store/ui'
import { t } from '@/app/lib/translations'
import { formatPrice, formatWeight } from '@/app/lib/utils'
import { Product } from '@/app/types'
import { Dialog, DialogContent } from './ui/dialog'
import { Eye, Plus, Minus, ShoppingCart, X } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onPreview: () => void
}

export function ProductCard({ product, onPreview }: ProductCardProps) {
  const { language } = useUIStore()
  const finalPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Product'
          }}
        />
        {product.isOnSale && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce-slow">
            {t('onSale', language)}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {product.category === 'fruits' ? '🍎' : '🥬'} {formatWeight(product.weight)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-gold font-bold text-xl">
            {formatPrice(finalPrice)}
          </span>
          <button
            onClick={onPreview}
            className="p-2 bg-gold/10 hover:bg-gold text-gold hover:text-white rounded-full transition"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ProductModalProps {
  product: Product
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { language } = useUIStore()
  const { addItem } = useCartStore()
  const [weight, setWeight] = useState(product.weight)
  const [isOpen, setIsOpen] = useState(true)

  const finalPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price
  const totalPrice = (finalPrice * weight) / 1000

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      weight: weight,
      image: product.image,
      isOnSale: product.isOnSale,
      salePrice: product.salePrice,
      unitPrice: finalPrice,
    }, weight)
    onClose()
  }

  const handleWeightChange = (value: number) => {
    const newWeight = Math.max(100, Math.min(5000, weight + value))
    setWeight(newWeight)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) onClose()
    }}>
      <DialogContent className="max-w-md">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover rounded-lg mb-4"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Product'
            }}
          />

          <h2 className="text-2xl font-aref text-gray-800 dark:text-gray-200 mb-2">
            {product.name}
          </h2>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-gold font-bold text-2xl">
              {formatPrice(totalPrice)}
            </span>
            {product.isOnSale && product.salePrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('weight', language)}: {formatWeight(weight)}
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleWeightChange(-100)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Math.max(100, parseInt(e.target.value) || 0))}
                className="w-24 text-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="100"
                max="5000"
              />
              <button
                onClick={() => handleWeightChange(100)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {t('addToCart', language)}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
