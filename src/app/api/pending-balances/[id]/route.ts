import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { settled_by } = body
    const { id } = await params

    if (!settled_by) {
      return NextResponse.json(
        { error: 'settled_by user ID is required' },
        { status: 400 }
      )
    }

    // Mark as settled with current timestamp
    const { data: pendingBalance, error } = await supabase
      .from('pending_balances')
      .update({
        settled_at: new Date().toISOString(),
        settled_by,
      })
      .eq('id', id)
      .is('settled_at', null) // Only update if not already settled
      .select()
      .single()

    if (error) {
      console.error('Error settling pending balance:', error)
      return NextResponse.json(
        { error: 'Failed to settle pending balance' },
        { status: 500 }
      )
    }

    if (!pendingBalance) {
      return NextResponse.json(
        { error: 'Pending balance not found or already settled' },
        { status: 404 }
      )
    }

    return NextResponse.json({ pendingBalance })
  } catch (error) {
    console.error('Settle pending balance API error:', error)
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

    // Only allow deletion if not settled
    const { error } = await supabase
      .from('pending_balances')
      .delete()
      .eq('id', id)
      .is('settled_at', null)

    if (error) {
      console.error('Error deleting pending balance:', error)
      return NextResponse.json(
        { error: 'Failed to delete pending balance' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete pending balance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
