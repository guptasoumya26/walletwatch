import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { amount, category, description, expense_date } = body
    const { id } = await params

    if (!amount || !category || !expense_date) {
      return NextResponse.json(
        { error: 'Amount, category, and date are required' },
        { status: 400 }
      )
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        amount: parseFloat(amount),
        category,
        description: description || '',
        expense_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating expense:', error)
      return NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      )
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Update expense API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting expense:', error)
      return NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete expense API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}