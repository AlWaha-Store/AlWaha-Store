import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const userId = searchParams.get('userId')

    // لو فيه كود، جلب كوبون واحد مباشرة
    if (code) {
      const { data, error } = await supabaseServer
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }

    // بناء الاستعلام
    let query = supabaseServer.from('coupons').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, discountPercent, expiresAt, userId } = body

    // التحقق من عدم وجود كوبون بنفس الكود
    const { data: existing, error: checkError } = await supabaseServer
      .from('coupons')
      .select('code')
      .eq('code', code.toUpperCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'الكوبون موجود بالفعل' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        discount_percent: discountPercent,
        expires_at: expiresAt,
        user_id: userId || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الكوبون مطلوب' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('coupons')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الكوبون مطلوب' },
        { status: 400 }
      )
    }

    const { error } = await supabaseServer
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
        } 
