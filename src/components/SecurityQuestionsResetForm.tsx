'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SecurityQuestionsResetFormProps {
  onBackToLogin: () => void
}

export default function SecurityQuestionsResetForm({ onBackToLogin }: SecurityQuestionsResetFormProps) {
  const [step, setStep] = useState<'username' | 'questions' | 'newPassword'>('username')
  const [username, setUsername] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState(['', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userId, setUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/get-security-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to get security questions')
        return
      }

      setQuestions(data.questions)
      setStep('questions')

    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Get security questions error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, answers }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Security answers do not match')
        return
      }

      setUserId(data.userId)
      setStep('newPassword')

    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Verify security questions error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password-security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to reset password')
        return
      }

      setSuccess('Password has been reset successfully! Redirecting to login...')

      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Reset password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <button
            onClick={onBackToLogin}
            className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {step === 'username' && 'Enter your username to get started'}
            {step === 'questions' && 'Answer your security questions'}
            {step === 'newPassword' && 'Set your new password'}
          </p>
        </div>

        {step === 'username' && (
          <form onSubmit={handleUsernameSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your username"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Get Security Questions'}
            </button>
          </form>
        )}

        {step === 'questions' && (
          <form onSubmit={handleQuestionsSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {question}
                  </label>
                  <input
                    type="text"
                    value={answers[index]}
                    onChange={(e) => {
                      const newAnswers = [...answers]
                      newAnswers[index] = e.target.value
                      setAnswers(newAnswers)
                    }}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your answer"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Answers'}
            </button>
          </form>
        )}

        {step === 'newPassword' && (
          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}