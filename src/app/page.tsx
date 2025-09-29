'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoginForm from '@/components/LoginForm'
import SignupForm from '@/components/SignupForm'
import SecurityQuestionsResetForm from '@/components/SecurityQuestionsResetForm'

type AuthMode = 'login' | 'signup' | 'forgot-password'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (authMode === 'signup') {
    return <SignupForm onBackToLogin={() => setAuthMode('login')} />
  }

  if (authMode === 'forgot-password') {
    return <SecurityQuestionsResetForm onBackToLogin={() => setAuthMode('login')} />
  }

  return (
    <LoginForm
      onShowSignup={() => setAuthMode('signup')}
      onShowForgotPassword={() => setAuthMode('forgot-password')}
    />
  )
}
