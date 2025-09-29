import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      security_question_1,
      security_answer_1,
      security_question_2,
      security_answer_2,
      security_question_3,
      security_answer_3
    } = await request.json()

    if (!userId || !security_question_1 || !security_answer_1 ||
        !security_question_2 || !security_answer_2 ||
        !security_question_3 || !security_answer_3) {
      return NextResponse.json(
        { error: 'All security questions and answers are required' },
        { status: 400 }
      )
    }

    // Hash the security answers
    const hashed_answer_1 = await hashPassword(security_answer_1.toLowerCase().trim())
    const hashed_answer_2 = await hashPassword(security_answer_2.toLowerCase().trim())
    const hashed_answer_3 = await hashPassword(security_answer_3.toLowerCase().trim())

    // Update the user's security questions
    const { error } = await supabase
      .from('users')
      .update({
        security_question_1,
        security_answer_1: hashed_answer_1,
        security_question_2,
        security_answer_2: hashed_answer_2,
        security_question_3,
        security_answer_3: hashed_answer_3,
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating security questions:', error)
      return NextResponse.json(
        { error: 'Failed to update security questions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Security questions updated successfully'
    })

  } catch (error) {
    console.error('Update security questions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}