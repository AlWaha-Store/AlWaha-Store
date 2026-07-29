import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  theme: 'light' | 'dark'
  language: 'ar' | 'en'
  isMenuOpen: boolean
  isCartOpen: boolean
  isSearchOpen: boolean
  toggleTheme: () => void
  toggleLanguage: () => void
  toggleMenu: () => void
  toggleCart: () => void
  toggleSearch: () => void
  setMenuOpen: (open: boolean) => void
  setCartOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
}

// منع استخدام localStorage في السيرفر
const isBrowser = typeof window !== 'undefined'

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ar',
      isMenuOpen: false,
      isCartOpen: false,
      isSearchOpen: false,

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          if (isBrowser) {
            document.documentElement.classList.toggle('dark')
          }
          return { theme: newTheme }
        })
      },

      toggleLanguage: () => {
        set((state) => ({
          language: state.language === 'ar' ? 'en' : 'ar',
        }))
      },

      toggleMenu: () => {
        set((state) => ({ isMenuOpen: !state.isMenuOpen }))
      },

      toggleCart: () => {
        set((state) => ({ isCartOpen: !state.isCartOpen }))
      },

      toggleSearch: () => {
        set((state) => ({ isSearchOpen: !state.isSearchOpen }))
      },

      setMenuOpen: (open) => {
        set({ isMenuOpen: open })
      },

      setCartOpen: (open) => {
        set({ isCartOpen: open })
      },

      setSearchOpen: (open) => {
        set({ isSearchOpen: open })
      },
    }),
    {
      name: 'ui-storage',
      skipHydration: true,
    }
  )
) 
