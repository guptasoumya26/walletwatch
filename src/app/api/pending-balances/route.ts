import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'settled', 'all'

    let query = supabase
      .from('pending_balances')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by settlement status
    if (status === 'active') {
      query = query.is('settled_at', null)
    } else if (status === 'settled') {
      query = query.not('settled_at', 'is', null)
    }
    // 'all' or no filter returns everything

    const { data: pendingBalances, error } = await query

    if (error) {
      console.error('Error fetching pending balances:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pending balances' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pendingBalances })
  } catch (error) {
    console.error('Pending balances API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { creditor_id, debtor_id, amount, description, category, created_by } = body

    // Validation
    if (!creditor_id || !debtor_id || !amount || !description || !category || !created_by) {
      return NextResponse.json(
        { error: 'Creditor ID, debtor ID, amount, description, category, and created_by are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (creditor_id === debtor_id) {
      return NextResponse.json(
        { error: 'Creditor and debtor cannot be the same user' },
        { status: 400 }
      )
    }

    const { data: pendingBalance, error } = await supabase
      .from('pending_balances')
      .insert({
        creditor_id,
        debtor_id,
        amount: parseFloat(amount),
        description,
        category,
        created_by,
        settled_at: null,
        settled_by: null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pending balance:', error)
      return NextResponse.json(
        { error: 'Failed to create pending balance' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pendingBalance }, { status: 201 })
  } catch (error) {
    console.error('Create pending balance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
