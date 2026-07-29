import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)

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
    const { userId, productId, weight, quantity } = body

    // التحقق من وجود المنتج في السلة
    const { data: existing, error: checkError } = await supabaseServer
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existing) {
      const { data, error } = await supabaseServer
        .from('cart_items')
        .update({
          quantity: existing.quantity + (quantity || 1),
          weight: existing.weight + (weight || 0),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    } else {
      const { data, error } = await supabaseServer
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          weight: weight || 0,
          quantity: quantity || 1,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }
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
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (id) {
      const { error } = await supabaseServer
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    } else {
      const { error } = await supabaseServer
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
} 
