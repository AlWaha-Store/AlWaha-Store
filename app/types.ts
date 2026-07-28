// ===== Product Types =====
export interface Product {
  id: string
  name: string
  category: 'fruits' | 'vegetables'
  price: number
  image: string
  weight: number
  isOnSale: boolean
  salePrice?: number
  createdAt: string
}

export interface ProductInput {
  name: string
  category: 'fruits' | 'vegetables'
  price: number
  image: string
  weight?: number
  isOnSale?: boolean
  salePrice?: number
}

// ===== User Types =====
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
  createdAt: string
}

export interface UserInput {
  email: string
  name: string
  phone: string
  address: string
  password: string
}

// ===== Cart Types =====
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

// ===== Order Types =====
export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  deliveryType: 'express' | 'scheduled'
  scheduledTime?: string
  paymentMethod: 'cash' | 'instapay' | 'wallet'
  customerName: string
  customerPhone: string
  address: string
  notes?: string
  couponCode?: string
  discount?: number
  status: 'pending' | 'confirmed' | 'delivered'
  createdAt: string
}

export interface OrderInput {
  userId: string
  items: CartItem[]
  total: number
  deliveryType: 'express' | 'scheduled'
  scheduledTime?: string
  paymentMethod: 'cash' | 'instapay' | 'wallet'
  customerName: string
  customerPhone: string
  address: string
  notes?: string
  couponCode?: string
  discount?: number
}

// ===== Coupon Types =====
export interface Coupon {
  id: string
  code: string
  discountPercent: number
  expiresAt: string
  isActive: boolean
  userId?: string
  createdAt: string
}

export interface CouponInput {
  code: string
  discountPercent: number
  expiresAt: string
  userId?: string
}

// ===== Admin Types =====
export interface AdminSettings {
  id: string
  password: string
  allowedIPs: string[]
  createdAt: string
}

// ===== API Response Types =====
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ===== Checkout Types =====
export interface CheckoutForm {
  name: string
  phone: string
  address: string
  notes?: string
  deliveryType: 'express' | 'scheduled'
  scheduledTime?: string
  paymentMethod: 'cash' | 'instapay' | 'wallet'
  couponCode?: string
}

// ===== Filter Types =====
export interface ProductFilters {
  category?: 'fruits' | 'vegetables' | 'all'
  search?: string
  onSale?: boolean
  } 
