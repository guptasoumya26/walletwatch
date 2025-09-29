import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Get user's security questions (not the answers)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('security_question_1, security_question_2, security_question_3')
      .eq('username', username)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has security questions set
    if (!user.security_question_1 || !user.security_question_2 || !user.security_question_3) {
      return NextResponse.json(
        { error: 'Security questions not set for this account' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      questions: [
        user.security_question_1,
        user.security_question_2,
        user.security_question_3
      ]
    })

  } catch (error) {
    console.error('Get security questions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}