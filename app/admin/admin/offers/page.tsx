'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Coupon } from '@/app/types'
import { formatPrice } from '@/app/lib/utils'

export default function OffersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    expiresAt: '',
    userId: '',
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCoupons(data || [])
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: formData.code.toUpperCase(),
          discount_percent: parseInt(formData.discountPercent),
          expires_at: formData.expiresAt,
          user_id: formData.userId || null,
          is_active: true,
        })

      if (error) throw error

      setShowForm(false)
      setFormData({ code: '', discountPercent: '', expiresAt: '', userId: '' })
      fetchCoupons()
    } catch (error) {
      console.error('Error adding coupon:', error)
      alert('حدث خطأ أثناء إضافة الكوبون')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCoupons()
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('حدث خطأ أثناء حذف الكوبون')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchCoupons()
    } catch (error) {
      console.error('Error toggling coupon:', error)
      alert('حدث خطأ أثناء تغيير حالة الكوبون')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة العروض والكوبونات</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition"
        >
          <span>➕</span>
          إضافة كوبون
        </button>
      </div>

      {/* Add Coupon Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">إضافة كوبون جديد</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="كود الكوبون (مثال: WELCOME10)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            <input
              type="number"
              placeholder="نسبة الخصم (مثال: 10)"
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            <input
              type="datetime-local"
              placeholder="تاريخ الانتهاء"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            <input
              type="text"
              placeholder="معرف المستخدم (اختياري)"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-gold text-white py-2 rounded-lg hover:bg-gold-dark transition"
              >
                إضافة
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right">الكود</th>
                <th className="px-4 py-3 text-right">الخصم</th>
                <th className="px-4 py-3 text-right">تاريخ الانتهاء</th>
                <th className="px-4 py-3 text-right">المستخدم</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-bold text-gold">{coupon.code}</td>
                  <td className="px-4 py-3">{coupon.discountPercent}%</td>
                  <td className="px-4 py-3">
                    {new Date(coupon.expiresAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-4 py-3">{coupon.userId || 'عام'}</td>
                  <td className="px-4 py-3">
                    {coupon.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">نشط</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">غير نشط</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                        className={`px-3 py-1 rounded-lg text-white text-sm transition ${
                          coupon.isActive
                            ? 'bg-gray-500 hover:bg-gray-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {coupon.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    لا توجد كوبونات حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
    } 
