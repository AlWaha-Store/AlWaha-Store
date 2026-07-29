'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  // منع تشغيل أي كود على السيرفر
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // تشغيل الكود بس بعد ما الموقع يتحمل في المتصفح
  useEffect(() => {
    if (!isMounted) return

    // استيراد الـ Stores بعد التحميل عشان نتجنب مشاكل السيرفر
    const { useUIStore } = require('@/app/store/ui')
    const { useAuthStore } = require('@/app/store/auth')

    const { theme, language } = useUIStore.getState()
    const { fetchUser } = useAuthStore.getState()

    // تطبيق المظهر
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // تطبيق اللغة
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'

    // التحقق من المستخدم
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await fetchUser(session.user.id)
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUser(session.user.id)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [isMounted])

  return <>{children}</>
            } 
