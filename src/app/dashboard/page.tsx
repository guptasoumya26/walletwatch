'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCurrentMonth } from '@/lib/auth'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

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
    <Dashboard
      user={user}
      currentMonth={currentMonth}
      setCurrentMonth={setCurrentMonth}
    />
  )
}