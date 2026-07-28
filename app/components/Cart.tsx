'use client'

import { useCartStore } from '@/app/store/cart'
import { useUIStore } from '@/app/store/ui'
import { t } from '@/app/lib/translations'
import { formatPrice, formatWeight } from '@/app/lib/utils'
import { ShoppingCart, X, Plus, Minus, Trash2, CreditCard } from 'lucide-react'
import { useState } from 'react'
import { CheckoutModal } from './Checkout'

export function CartButton() {
  const { toggleCart, isCartOpen } = useUIStore()
  const { getTotalItems, getTotalPrice } = useCartStore()
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <>
      <button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-50 bg-gold text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold cart-badge-pulse">
              {totalItems}
            </span>
          )}
        </div>
      </button>

      {/* Simple Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80" onClick={toggleCart}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CartSidebar />
          </div>
        </div>
      )}
    </>
  )
}

export function CartSidebar() {
  const { language } = useUIStore()
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()
  const [showCheckout, setShowCheckout] = useState(false)
  const totalPrice = getTotalPrice()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <button
          onClick={() => useUIStore.getState().toggleCart()}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
        >
          <X className="w-6 h-6" />
        </button>
        <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
        <p className="text-xl text-gray-500">{t('emptyCart', language)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-aref text-gold">{t('cart', language)}</h2>
        <div className="flex gap-2">
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-600 transition"
          >
            تفريغ
          </button>
          <button
            onClick={() => useUIStore.getState().toggleCart()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h4>
              <p className="text-sm text-gray-500">{formatWeight(item.weight)}</p>
              <p className="text-gold font-bold">{formatPrice(item.price * item.weight * item.quantity / 1000)}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold">{t('total', language)}</span>
          <span className="text-2xl font-aref text-gold">{formatPrice(totalPrice)}</span>
        </div>
        <button
          onClick={() => setShowCheckout(true)}
          className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {t('checkout', language)}
        </button>
      </div>

      {showCheckout && (
        <CheckoutModal onClose={() => setShowCheckout(false)} />
      )}
    </div>
  )
} 
