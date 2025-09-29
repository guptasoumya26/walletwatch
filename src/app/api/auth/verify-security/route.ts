import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, answers } = await request.json()

    if (!username || !answers || answers.length !== 3) {
      return NextResponse.json(
        { error: 'Username and 3 security answers are required' },
        { status: 400 }
      )
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, security_question_1, security_answer_1, security_question_2, security_answer_2, security_question_3, security_answer_3')
      .eq('username', username)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.security_question_1 || !user.security_answer_1 ||
        !user.security_question_2 || !user.security_answer_2 ||
        !user.security_question_3 || !user.security_answer_3) {
      return NextResponse.json(
        { error: 'Security questions not set for this account' },
        { status: 400 }
      )
    }

    const answer1Valid = await bcrypt.compare(answers[0].toLowerCase().trim(), user.security_answer_1)
    const answer2Valid = await bcrypt.compare(answers[1].toLowerCase().trim(), user.security_answer_2)
    const answer3Valid = await bcrypt.compare(answers[2].toLowerCase().trim(), user.security_answer_3)

    if (!answer1Valid || !answer2Valid || !answer3Valid) {
      return NextResponse.json(
        { error: 'Security answers do not match' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: 'Security questions verified successfully'
    })

  } catch (error) {
    console.error('Verify security API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}