import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const {
      username,
      email,
      password,
      security_question_1,
      security_answer_1,
      security_question_2,
      security_answer_2,
      security_question_3,
      security_answer_3
    } = await request.json()

    if (!username || !email || !password ||
        !security_question_1 || !security_answer_1 ||
        !security_question_2 || !security_answer_2 ||
        !security_question_3 || !security_answer_3) {
      return NextResponse.json(
        { error: 'All fields including security questions are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    const password_hash = await hashPassword(password)
    const hashed_answer_1 = await hashPassword(security_answer_1.toLowerCase().trim())
    const hashed_answer_2 = await hashPassword(security_answer_2.toLowerCase().trim())
    const hashed_answer_3 = await hashPassword(security_answer_3.toLowerCase().trim())

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password_hash,
        security_question_1,
        security_answer_1: hashed_answer_1,
        security_question_2,
        security_answer_2: hashed_answer_2,
        security_question_3,
        security_answer_3: hashed_answer_3,
      })
      .select('id, username, email')
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user,
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}