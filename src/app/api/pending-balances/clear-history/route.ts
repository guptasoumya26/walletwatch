import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Step 1: Fetch all settled balances
    const { data: allSettledBalances, error: fetchError } = await supabase
      .from('pending_balances')
      .select('*')
      .not('settled_at', 'is', null)

    if (fetchError) {
      console.error('Error fetching settled balances:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch settled balances' },
        { status: 500 }
      )
    }

    // Filter: only balances NOT already cleared for this user
    const settledBalances = (allSettledBalances || []).filter((balance) => {
      const clearedFor = balance.cleared_for || []
      return !clearedFor.includes(user_id)
    })

    if (settledBalances.length === 0) {
      return NextResponse.json({
        message: 'No settled history to clear',
        clearedCount: 0
      })
    }

    // Step 2: Generate a batch ID for this clear operation
    const batchId = crypto.randomUUID()

    // Step 3: Archive the balances (using admin client to bypass RLS)
    const archiveRecords = settledBalances.map((balance) => ({
      original_balance_id: balance.id,
      creditor_id: balance.creditor_id,
      debtor_id: balance.debtor_id,
      amount: balance.amount,
      description: balance.description,
      category: balance.category,
      created_at: balance.created_at,
      settled_at: balance.settled_at,
      settled_by: balance.settled_by,
      created_by: balance.created_by,
      cleared_by: user_id,
      cleared_at: new Date().toISOString(),
      batch_id: batchId,
    }))

    const { error: archiveError } = await supabaseAdmin
      .from('pending_balances_archive')
      .insert(archiveRecords)

    if (archiveError) {
      console.error('Error archiving balances:', archiveError)
      return NextResponse.json(
        { error: 'Failed to archive settled balances' },
        { status: 500 }
      )
    }

    // Step 4: Update pending_balances to mark as cleared for this user
    // Add user_id to cleared_for array for each balance
    const updatePromises = settledBalances.map((balance) => {
      const currentClearedFor = balance.cleared_for || []
      const updatedClearedFor = [...currentClearedFor, user_id]

      return supabase
        .from('pending_balances')
        .update({ cleared_for: updatedClearedFor })
        .eq('id', balance.id)
    })

    const updateResults = await Promise.all(updatePromises)
    const updateErrors = updateResults.filter((result) => result.error)

    if (updateErrors.length > 0) {
      console.error('Error updating cleared_for:', updateErrors)
      return NextResponse.json(
        { error: 'Failed to update some balances' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Settled history cleared successfully',
      clearedCount: settledBalances.length,
      batchId,
    })
  } catch (error) {
    console.error('Clear history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
