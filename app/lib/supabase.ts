import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client side (for components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server side (for API routes)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

// For middleware (session checking)
export const supabaseMiddleware = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// Types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string
          address: string
          points: number
          referrals: number
          orders_count: number
          is_blocked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone: string
          address: string
          points?: number
          referrals?: number
          orders_count?: number
          is_blocked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          address?: string
          points?: number
          referrals?: number
          orders_count?: number
          is_blocked?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category: 'fruits' | 'vegetables'
          price: number
          image: string
          weight: number
          is_on_sale: boolean
          sale_price?: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'fruits' | 'vegetables'
          price: number
          image: string
          weight?: number
          is_on_sale?: boolean
          sale_price?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'fruits' | 'vegetables'
          price?: number
          image?: string
          weight?: number
          is_on_sale?: boolean
          sale_price?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          items: any
          total: number
          delivery_type: 'express' | 'scheduled'
          scheduled_time?: string
          payment_method: 'cash' | 'instapay' | 'wallet'
          customer_name: string
          customer_phone: string
          address: string
          notes?: string
          coupon_code?: string
          discount?: number
          status: 'pending' | 'confirmed' | 'delivered'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          items: any
          total: number
          delivery_type: 'express' | 'scheduled'
          scheduled_time?: string
          payment_method: 'cash' | 'instapay' | 'wallet'
          customer_name: string
          customer_phone: string
          address: string
          notes?: string
          coupon_code?: string
          discount?: number
          status?: 'pending' | 'confirmed' | 'delivered'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          items?: any
          total?: number
          delivery_type?: 'express' | 'scheduled'
          scheduled_time?: string
          payment_method?: 'cash' | 'instapay' | 'wallet'
          customer_name?: string
          customer_phone?: string
          address?: string
          notes?: string
          coupon_code?: string
          discount?: number
          status?: 'pending' | 'confirmed' | 'delivered'
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_percent: number
          expires_at: string
          is_active: boolean
          user_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_percent: number
          expires_at: string
          is_active?: boolean
          user_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_percent?: number
          expires_at?: string
          is_active?: boolean
          user_id?: string
          created_at?: string
        }
      }
      admin_settings: {
        Row: {
          id: string
          password: string
          allowed_ips: string[]
          created_at: string
        }
        Insert: {
          id?: string
          password: string
          allowed_ips?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          password?: string
          allowed_ips?: string[]
          created_at?: string
        }
      }
    }
  }
      } 
