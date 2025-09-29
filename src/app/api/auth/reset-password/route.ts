import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Verify the reset token
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('*, users(id, username, email)')
      .eq('reset_token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (resetError || !resetData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash the new password
    const password_hash = await hashPassword(password)

    // Update the user's password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', resetData.user_id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Mark the reset token as used
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', resetData.id)

    return NextResponse.json({
      message: 'Password has been reset successfully'
    })

  } catch (error) {
    console.error('Reset password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}