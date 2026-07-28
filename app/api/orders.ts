import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('id')

    // إذا كان المطلوب جلب طلب واحد محدد برقم الـ ID
    if (orderId) {
      const { data, error } = await supabaseServer
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }

    // إذا كان المطلوب جلب قائمة طلبات (سواء لجميع المستخدمين أو لمستخدم معين)
    let query = supabaseServer.from('orders').select('*')

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
    const {
      userId,
      items,
      total,
      deliveryType,
      scheduledTime,
      paymentMethod,
      customerName,
      customerPhone,
      address,
      notes,
      couponCode,
      discount,
    } = body

    const { data, error } = await supabaseServer
      .from('orders')
      .insert({
        user_id: userId || 'guest',
        items,
        total,
        delivery_type: deliveryType,
        scheduled_time: scheduledTime || null,
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_phone: customerPhone,
        address,
        notes: notes || null,
        coupon_code: couponCode || null,
        discount: discount || 0,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    if (userId && userId !== 'guest') {
      await supabaseServer.rpc('increment_user_orders', { user_id: userId })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
