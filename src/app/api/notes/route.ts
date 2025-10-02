import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const month = searchParams.get('month')

    if (!userId || !month) {
      return NextResponse.json(
        { error: 'User ID and month are required' },
        { status: 400 }
      )
    }

    const { data: note, error } = await supabaseAdmin
      .from('monthly_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching note:', error)
      return NextResponse.json(
        { error: 'Failed to fetch note' },
        { status: 500 }
      )
    }

    return NextResponse.json({ note: note || { note_content: '' } })
  } catch (error) {
    console.error('Notes API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, month, note_content } = body

    if (!user_id || !month) {
      return NextResponse.json(
        { error: 'User ID and month are required' },
        { status: 400 }
      )
    }

    const { data: note, error } = await supabaseAdmin
      .from('monthly_notes')
      .upsert(
        {
          user_id,
          month,
          note_content: note_content || '',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,month'
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving note:', error)
      return NextResponse.json(
        { error: 'Failed to save note' },
        { status: 500 }
      )
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Save note API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}