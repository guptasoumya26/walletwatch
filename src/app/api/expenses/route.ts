import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter is required' },
        { status: 400 }
      )
    }

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('month', month)
      .order('expense_date', { ascending: false })

    if (error) {
      console.error('Error fetching expenses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch expenses' },
        { status: 500 }
      )
    }

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Expenses API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, amount, category, description, expense_date, month } = body

    if (!user_id || !amount || !category || !expense_date || !month) {
      return NextResponse.json(
        { error: 'User ID, amount, category, date, and month are required' },
        { status: 400 }
      )
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        user_id,
        amount: parseFloat(amount),
        category,
        description: description || '',
        expense_date,
        month,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating expense:', error)
      return NextResponse.json(
        { error: 'Failed to create expense' },
        { status: 500 }
      )
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Create expense API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}