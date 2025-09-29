'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SECURITY_QUESTIONS } from '@/lib/securityQuestions'
import { ArrowLeft, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [securityQuestion1, setSecurityQuestion1] = useState('')
  const [securityAnswer1, setSecurityAnswer1] = useState('')
  const [securityQuestion2, setSecurityQuestion2] = useState('')
  const [securityAnswer2, setSecurityAnswer2] = useState('')
  const [securityQuestion3, setSecurityQuestion3] = useState('')
  const [securityAnswer3, setSecurityAnswer3] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/user/update-security-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          security_question_1: securityQuestion1,
          security_answer_1: securityAnswer1,
          security_question_2: securityQuestion2,
          security_answer_2: securityAnswer2,
          security_question_3: securityQuestion3,
          security_answer_3: securityAnswer3,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update security questions')
        return
      }

      setMessage('Security questions updated successfully!')

    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Update security questions error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Security Questions Setup
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Set up security questions to help recover your account if you forget your password.
          </p>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Security Question 1 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Security Question 1
              </label>
              <select
                value={securityQuestion1}
                onChange={(e) => setSecurityQuestion1(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a question...</option>
                {SECURITY_QUESTIONS.map((question, index) => (
                  <option key={index} value={question}>{question}</option>
                ))}
              </select>
              <input
                type="text"
                value={securityAnswer1}
                onChange={(e) => setSecurityAnswer1(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your answer"
              />
            </div>

            {/* Security Question 2 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Security Question 2
              </label>
              <select
                value={securityQuestion2}
                onChange={(e) => setSecurityQuestion2(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a question...</option>
                {SECURITY_QUESTIONS.filter(q => q !== securityQuestion1).map((question, index) => (
                  <option key={index} value={question}>{question}</option>
                ))}
              </select>
              <input
                type="text"
                value={securityAnswer2}
                onChange={(e) => setSecurityAnswer2(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your answer"
              />
            </div>

            {/* Security Question 3 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Security Question 3
              </label>
              <select
                value={securityQuestion3}
                onChange={(e) => setSecurityQuestion3(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a question...</option>
                {SECURITY_QUESTIONS.filter(q => q !== securityQuestion1 && q !== securityQuestion2).map((question, index) => (
                  <option key={index} value={question}>{question}</option>
                ))}
              </select>
              <input
                type="text"
                value={securityAnswer3}
                onChange={(e) => setSecurityAnswer3(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your answer"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Security Questions'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}