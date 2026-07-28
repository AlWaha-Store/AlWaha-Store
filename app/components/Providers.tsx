'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/app/store/ui'
import { useAuthStore } from '@/app/store/auth'
import { supabase } from '@/app/lib/supabase'

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme, language } = useUIStore()
  const { fetchUser } = useAuthStore()

  useEffect(() => {
    // تطبيق المظهر
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // تطبيق اللغة
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [theme, language])

  useEffect(() => {
    // التحقق من حالة المستخدم عند التحميل
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await fetchUser(session.user.id)
      }
    }
    checkUser()

    // الاستماع لتغييرات المصادقة
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
  }, [fetchUser])

  return <>{children}</>
          } 
