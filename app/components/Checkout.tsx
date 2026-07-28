'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/app/store/cart'
import { useAuthStore } from '@/app/store/auth'
import { useUIStore } from '@/app/store/ui'
import { t } from '@/app/lib/translations'
import { formatPrice, formatWeight, validatePhone } from '@/app/lib/utils'
import { WHATSAPP_NUMBER, INSTAPAY_NUMBER } from '@/app/lib/constants'
import { supabase } from '@/app/lib/supabase'
import { Dialog, DialogContent } from './ui/dialog'
import { X, CreditCard, Truck, Clock, DollarSign, Wallet, Check } from 'lucide-react'
import { CheckoutForm, Coupon } from '@/app/types'

interface CheckoutModalProps {
  onClose: () => void
}

export function CheckoutModal({ onClose }: CheckoutModalProps) {
  const { language } = useUIStore()
  const { user } = useAuthStore()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const totalPrice = getTotalPrice()
  const [isOpen, setIsOpen] = useState(true)
  const [formData, setFormData] = useState<CheckoutForm>({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: '',
    deliveryType: 'express',
    paymentMethod: 'cash',
  })
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableTime, setAvailableTime] = useState('')

  useEffect(() => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    const minTime = now.toTimeString().slice(0, 5)
    setAvailableTime(minTime)
  }, [])

  const finalTotal = totalPrice - discount

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('الرجاء إدخال كود الكوبون')
      return
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setError('كوبون غير صالح')
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('انتهت صلاحية الكوبون')
        return
      }

      setCoupon(data)
      setDiscount((totalPrice * data.discount_percent) / 100)
      setError('')
    } catch (error) {
      setError('حدث خطأ أثناء التحقق من الكوبون')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (!formData.name.trim()) {
      setError('الاسم مطلوب')
      setLoading(false)
      return
    }
    if (!validatePhone(formData.phone)) {
      setError('رقم الهاتف غير صحيح')
      setLoading(false)
      return
    }
    if (!formData.address.trim()) {
      setError('العنوان مطلوب')
      setLoading(false)
      return
    }
    if (formData.deliveryType === 'scheduled' && !formData.scheduledTime) {
      setError('الرجاء اختيار وقت التوصيل')
      setLoading(false)
      return
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || 'guest',
          items: items,
          total: finalTotal,
          delivery_type: formData.deliveryType,
          scheduled_time: formData.scheduledTime,
          payment_method: formData.paymentMethod,
          customer_name: formData.name,
          customer_phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
          coupon_code: coupon?.code,
          discount: discount,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      if (user) {
        await supabase
          .from('users')
          .update({
            orders_count: user.ordersCount + 1,
            points: user.points + 1,
          })
          .eq('id', user.id)
      }

      const message = prepareWhatsAppMessage(formData, items, finalTotal, discount, coupon)
      const encodedMessage = encodeURIComponent(message)
      window.open(`https://wa.me/20${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank')

      clearCart()
      setIsOpen(false)
      onClose()
    } catch (error) {
      console.error('Order error:', error)
      setError('حدث خطأ أثناء تأكيد الطلب')
    } finally {
      setLoading(false)
    }
  }

  const prepareWhatsAppMessage = (
    formData: CheckoutForm,
    items: any[],
    total: number,
    discount: number,
    coupon: Coupon | null
  ) => {
    let message = `🛒 *طلب جديد من متجر الواحة* 🌱\n\n`
    message += `*📋 تفاصيل الطلب:*\n`
    
    items.forEach((item, index) => {
      const price = item.isOnSale && item.salePrice ? item.salePrice : item.price
      message += `${index + 1}. ${item.name} - ${formatWeight(item.weight)} × ${item.quantity} = ${formatPrice(price * item.weight * item.quantity / 1000)}\n`
    })

    message += `\n*💰 المجموع:* ${formatPrice(total)}`
    if (discount > 0) {
      message += `\n*🎫 الخصم:* -${formatPrice(discount)} (كوبون: ${coupon?.code})`
      message += `\n*💵 الإجمالي بعد الخصم:* ${formatPrice(total)}`
    }

    message += `\n\n*👤 بيانات العميل:*`
    message += `\nالاسم: ${formData.name}`
    message += `\nالهاتف: ${formData.phone}`
    message += `\nالعنوان: ${formData.address}`
    if (formData.notes) {
      message += `\nملاحظات: ${formData.notes}`
    }

    message += `\n\n*🚚 نوع التوصيل:* ${formData.deliveryType === 'express' ? 'توصيل سريع' : 'توصيل في وقت معين'}`
    if (formData.deliveryType === 'scheduled') {
      message += `\n🕐 الوقت المحدد: ${formData.scheduledTime}`
    }

    message += `\n\n*💳 طريقة الدفع:* ${getPaymentMethodText(formData.paymentMethod)}`
    
    if (formData.paymentMethod === 'instapay' || formData.paymentMethod === 'wallet') {
      message += `\n*🏦 رقم التحويل:* ${INSTAPAY_NUMBER}`
    }

    message += `\n\n✅ *شكراً لتسوقك معنا!* 🌱`

    return message
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'كاش عند التوصيل'
      case 'instapay': return 'إنستا باي'
      case 'wallet': return 'محفظة إلكترونية'
      default: return method
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) onClose()
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={() => {
              setIsOpen(false)
              onClose()
            }}
            className="absolute -top-2 -right-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-aref text-gold mb-6 text-center">
            {t('orderSummary', language)}
          </h2>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="font-bold mb-3">{t('orderSummary', language)}</h3>
            {items.map((item) => {
              const price = item.isOnSale && item.salePrice ? item.salePrice : item.price
              const itemTotal = (price * item.weight * item.quantity) / 1000
              return (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                  <span>{item.name} × {item.quantity} ({formatWeight(item.weight)})</span>
                  <span className="font-bold">{formatPrice(itemTotal)}</span>
                </div>
              )
            })}
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t-2 border-gold">
              <span>{t('total', language)}</span>
              <span className="text-gold">{formatPrice(totalPrice)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 mt-2">
                <span>🎫 خصم ({coupon?.discountPercent}%)</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl mt-2 pt-2 border-t-2 border-gray-300 dark:border-gray-600">
              <span>الإجمالي</span>
              <span className="text-gold">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={t('couponPlaceholder', language)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
              />
              <button
                onClick={applyCoupon}
                className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition font-bold"
              >
                {t('applyCoupon', language)}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {/* Customer Details */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold">{t('customerDetails', language)}</h3>
            
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={t('name', language)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
              required
            />

            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder={t('phone', language)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
              required
            />

            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder={t('addressPlaceholder', language)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
              required
            />

            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder={t('notesPlaceholder', language)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
            />
          </div>

          {/* Delivery Type */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">{t('deliveryType', language)}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({...formData, deliveryType: 'express'})}
                className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  formData.deliveryType === 'express'
                    ? 'border-gold bg-gold/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gold'
                }`}
              >
                <Truck className="w-5 h-5" />
                <span>{t('express', language)}</span>
              </button>
              <button
                onClick={() => setFormData({...formData, deliveryType: 'scheduled'})}
                className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  formData.deliveryType === 'scheduled'
                    ? 'border-gold bg-gold/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gold'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>{t('scheduled', language)}</span>
              </button>
            </div>
            {formData.deliveryType === 'scheduled' && (
              <input
                type="time"
                value={formData.scheduledTime || ''}
                onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                min={availableTime}
                className="w-full mt-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
              />
            )}
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">{t('paymentMethod', language)}</h3>
            <div className="grid grid-cols-3 gap-3">
              {['cash', 'instapay', 'wallet'].map((method) => (
                <button
                  key={method}
                  onClick={() => setFormData({...formData, paymentMethod: method as any})}
                  className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                    formData.paymentMethod === method
                      ? 'border-gold bg-gold/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gold'
                  }`}
                >
                  {method === 'cash' && <DollarSign className="w-5 h-5" />}
                  {method === 'instapay' && <Wallet className="w-5 h-5" />}
                  {method === 'wallet' && <CreditCard className="w-5 h-5" />}
                  <span className="text-xs">{t(method as any, language)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-3 text-lg shadow-lg"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Check className="w-6 h-6" />
                {t('confirmPayment', language)}
              </>
            )}
          </button>

          {error && (
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
    } 
