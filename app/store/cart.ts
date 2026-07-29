import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  weight: number
  image: string
  isOnSale: boolean
  salePrice?: number
  quantity: number
  unitPrice: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, weight: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, weight) => {
        const { items } = get()
        const existingItem = items.find(i => i.id === item.id)

        if (existingItem) {
          const updatedItems = items.map(i =>
            i.id === item.id
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                  weight: i.weight + weight,
                }
              : i
          )
          set({ items: updatedItems })
        } else {
          const newItem: CartItem = {
            ...item,
            weight: weight,
            quantity: 1,
            unitPrice: item.isOnSale && item.salePrice ? item.salePrice : item.price,
          }
          set({ items: [...items, newItem] })
        }
      },

      removeItem: (id) => {
        const { items } = get()
        set({ items: items.filter(item => item.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        const { items } = get()
        if (quantity <= 0) {
          set({ items: items.filter(item => item.id !== id) })
          return
        }
        const updatedItems = items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
        set({ items: updatedItems })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const price = item.isOnSale && item.salePrice ? item.salePrice : item.price
          return total + (price * item.weight * item.quantity) / 1000
        }, 0)
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
    }
  )
) 
