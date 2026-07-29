
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabase'
import { ADMIN_PASSWORD } from '@/app/lib/constants'

export async function POST(request: Request) {
  try {
    const { action, ...data } = await request.json()

    if (action === 'verify') {
      const { password, ip } = data
      
      if (password === ADMIN_PASSWORD) {
        const { data: settings, error } = await supabaseServer
          .from('admin_settings')
          .select('allowed_ips')
          .maybeSingle()

        if (!error && settings) {
          const allowedIPs = settings.allowed_ips || []
          if (allowedIPs.length > 0 && !allowedIPs.includes(ip)) {
            return NextResponse.json({
              success: false,
              error: 'IP not allowed',
              blocked: true,
            })
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Verified successfully',
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Invalid password',
      })
    }

    if (action === 'settings') {
      const { password, allowedIPs } = data

      const { data: existing, error: checkError } = await supabaseServer
        .from('admin_settings')
        .select('id')
        .maybeSingle()

      let result
      if (existing) {
        result = await supabaseServer
          .from('admin_settings')
          .update({ password, allowed_ips: allowedIPs })
          .eq('id', existing.id)
          .select()
          .single()
      } else {
        result = await supabaseServer
          .from('admin_settings')
          .insert({ password, allowed_ips: allowedIPs })
          .select()
          .single()
      }

      if (result.error) throw result.error
      return NextResponse.json({ success: true, data: result.data })
    }

    if (action === 'getSettings') {
      const { data, error } = await supabaseServer
        .from('admin_settings')
        .select('*')
        .maybeSingle()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
          } 
