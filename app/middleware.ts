import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseMiddleware } from './lib/supabase'
import { ADMIN_PASSWORD } from './lib/constants'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // حماية لوحة التحكم
  if (pathname.startsWith('/admin')) {
    // استثناء صفحة دخول الأدمن
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // التحقق من كلمة السر في الـ session
    const session = request.cookies.get('admin_session')
    const clientIP = request.headers.get('x-forwarded-for') || '0.0.0.0'

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // التحقق من صحة الجلسة
      const sessionData = JSON.parse(session.value)
      if (sessionData.password !== ADMIN_PASSWORD) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // التحقق من الـ IP من قاعدة البيانات
      const { data: settings, error } = await supabaseMiddleware
        .from('admin_settings')
        .select('allowed_ips')
        .single()

      if (!error && settings) {
        const allowedIPs = settings.allowed_ips || []
        if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
          // تسجيل محاولة دخول غير مصرح بها
          console.warn(`⚠️ محاولة دخول غير مصرح بها من IP: ${clientIP}`)
          return NextResponse.redirect(new URL('/admin/login?blocked=true', request.url))
        }
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
  } 
