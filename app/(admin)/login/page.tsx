'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/app/store/ui'
import { t } from '@/app/lib/translations'
import { ADMIN_PASSWORD } from '@/app/lib/constants'
import { Lock, Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { language } = useUIStore()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    // التحقق من وجود جلسة
    const session = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_session='))
    
    if (session) {
      try {
        const data = JSON.parse(decodeURIComponent(session.split('=')[1]))
        if (data.password === ADMIN_PASSWORD) {
          router.push('/admin')
          return
        }
      } catch (e) {}
    }

    // التحقق من معامل الحظر
    const params = new URLSearchParams(window.location.search)
    if (params.get('blocked') === 'true') {
      setIsBlocked(true)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // الحصول على IP العميل
    let clientIP = '0.0.0.0'
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      clientIP = data.ip
    } catch (error) {
      console.log('Could not get IP')
    }

    // التحقق من كلمة السر والـ IP
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        password,
        ip: clientIP,
      }),
    })

    const result = await response.json()

    if (result.success) {
      // حفظ الجلسة
      document.cookie = `admin_session=${JSON.stringify({ password, ip: clientIP })}; path=/; max-age=3600`
      router.push('/admin')
    } else {
      if (result.blocked) {
        setError('⚠️ عنوان IP غير مصرح به. تم تسجيل المحاولة.')
        setIsBlocked(true)
      } else {
        setError('كلمة السر غير صحيحة')
        // تسجيل محاولة فاشلة
        console.warn(`⚠️ محاولة دخول فاشلة من IP: ${clientIP}`)
      }
    }

    setLoading(false)
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-500 mb-4">تم الحظر</h1>
          <p className="text-gray-600 dark:text-gray-300">
            عنوان IP الخاص بك غير مصرح به للدخول إلى لوحة التحكم.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            تم تسجيل محاولة الوصول وسيتم إعلام المسؤول.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gold-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-3xl font-aref text-gold">
            {t('adminPanel', language)}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            أدخل كلمة السر للدخول
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              كلمة السر
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
                placeholder="أدخل كلمة السر"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                دخول
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          محاولات الدخول الفاشلة يتم تسجيلها
        </p>
      </div>
    </div>
  )
} 
