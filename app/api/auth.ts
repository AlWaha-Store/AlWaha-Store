import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabase'

export async function POST(request: Request) {
  try {
    const { action, ...data } = await request.json()

    if (action === 'login') {
      const { email, password } = data
      const { data: authData, error } = await supabaseServer.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return NextResponse.json({ success: true, user: authData.user })
    }

    if (action === 'register') {
      const { email, password, name, phone, address } = data
      const { data: authData, error } = await supabaseServer.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, address },
        },
      })

      if (error) throw error

      if (authData.user) {
        await supabaseServer.from('users').insert({
          id: authData.user.id,
          email,
          name,
          phone,
          address,
          points: 0,
          referrals: 0,
          orders_count: 0,
          is_blocked: false,
        })
      }

      return NextResponse.json({ success: true, user: authData.user })
    }

    if (action === 'logout') {
      const { error } = await supabaseServer.auth.signOut()
      if (error) throw error
      return NextResponse.json({ success: true })
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
