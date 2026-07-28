import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/app/lib/supabase'

export interface User {
  id: string
  email: string
  name: string
  phone: string
  address: string
  points: number
  referrals: number
  ordersCount: number
  isBlocked: boolean
}

interface AuthStore {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, 'id' | 'points' | 'referrals' | 'ordersCount' | 'isBlocked'>, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  fetchUser: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          if (data.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (userError) throw userError

            set({
              user: userData,
              isLoggedIn: true,
              isLoading: false,
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Login error:', error)
          set({ isLoading: false })
          return false
        }
      },

      register: async (userData, password) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password,
            options: {
              data: {
                name: userData.name,
                phone: userData.phone,
                address: userData.address,
              },
            },
          })

          if (error) throw error

          if (data.user) {
            const { error: insertError } = await supabase.from('users').insert({
              id: data.user.id,
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              address: userData.address,
              points: 0,
              referrals: 0,
              orders_count: 0,
              is_blocked: false,
            })

            if (insertError) throw insertError

            set({
              user: {
                ...userData,
                id: data.user.id,
                points: 0,
                referrals: 0,
                ordersCount: 0,
                isBlocked: false,
              },
              isLoggedIn: true,
              isLoading: false,
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Registration error:', error)
          set({ isLoading: false })
          return false
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) throw error
          set({ isLoading: false })
          return true
        } catch (error) {
          console.error('Google login error:', error)
          set({ isLoading: false })
          return false
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            isLoggedIn: false,
          })
        } catch (error) {
          console.error('Logout error:', error)
        }
      },

      updateUser: async (userData) => {
        const { user } = get()
        if (!user) return

        try {
          const { error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', user.id)

          if (error) throw error

          set({
            user: { ...user, ...userData },
          })
        } catch (error) {
          console.error('Update user error:', error)
        }
      },

      fetchUser: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) throw error

          set({
            user: data,
            isLoggedIn: true,
          })
        } catch (error) {
          console.error('Fetch user error:', error)
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
) 
