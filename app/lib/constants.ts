export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '01229156909'
export const INSTAPAY_NUMBER = process.env.NEXT_PUBLIC_INSTAPAY_NUMBER || '01005777923'
export const EMAIL = process.env.NEXT_PUBLIC_EMAIL || 'seifshaban0990@gmail.com'
export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'seif1876'

export const COLORS = {
  gold: '#C9A44D',
  goldDark: '#B8943D',
  goldLight: '#D4AF37',
  green: '#2E7D32',
  greenLight: '#4CAF50',
  greenDark: '#1B5E20',
  orange: '#F57C00',
  orangeLight: '#FFA726',
  orangeDark: '#E65100',
}

export const CATEGORIES = {
  fruits: 'فاكهة',
  vegetables: 'خضروات',
} as const

export const DELIVERY_TYPES = {
  express: 'توصيل سريع',
  scheduled: 'توصيل في وقت معين',
} as const

export const PAYMENT_METHODS = {
  cash: 'كاش عند التوصيل',
  instapay: 'إنستا باي',
  wallet: 'محفظة إلكترونية',
} as const

export const ORDER_STATUS = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  delivered: 'تم التوصيل',
} as const 
