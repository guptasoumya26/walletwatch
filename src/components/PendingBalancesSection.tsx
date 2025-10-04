'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { User, PendingBalance } from '@/lib/types'
import PendingBalanceForm from './PendingBalanceForm'
import PendingBalancesList from './PendingBalancesList'

interface PendingBalancesSectionProps {
  user: User
  partnerUser: User
}

export default function PendingBalancesSection({
  user,
  partnerUser,
}: PendingBalancesSectionProps) {
  const [pendingBalances, setPendingBalances] = useState<PendingBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const fetchPendingBalances = useCallback(async () => {
    try {
      setError('')
      const response = await fetch('/api/pending-balances?status=all')
      if (response.ok) {
        const data = await response.json()
        setPendingBalances(data.pendingBalances || [])
      } else {
        setError('Failed to load pending balances')
      }
    } catch (error) {
      console.error('Error fetching pending balances:', error)
      setError('Failed to load pending balances')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPendingBalances()
  }, [fetchPendingBalances])

  const handleBalanceAdded = () => {
    fetchPendingBalances()
    setShowForm(false)
  }

  const handleSettle = async (id: string) => {
    if (!confirm('Mark this pending balance as settled?')) return

    try {
      const response = await fetch(`/api/pending-balances/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settled_by: user.id,
        }),
      })

      if (response.ok) {
        fetchPendingBalances()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to settle pending balance')
      }
    } catch (error) {
      console.error('Error settling pending balance:', error)
      alert('An error occurred while settling the balance')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pending balance?')) return

    try {
      const response = await fetch(`/api/pending-balances/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPendingBalances()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete pending balance')
      }
    } catch (error) {
      console.error('Error deleting pending balance:', error)
      alert('An error occurred while deleting the balance')
    }
  }

  const handleClearHistory = async () => {
    try {
      const response = await fetch('/api/pending-balances/clear-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        fetchPendingBalances()
        alert(`Cleared ${data.clearedCount} item(s) from your settled history. Records archived for admin review.`)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to clear settled history')
      }
    } catch (error) {
      console.error('Error clearing history:', error)
      alert('An error occurred while clearing the history')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pending Balances
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Pending Balance</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {showForm && (
        <PendingBalanceForm
          user={user}
          partnerUser={partnerUser}
          onClose={() => setShowForm(false)}
          onBalanceAdded={handleBalanceAdded}
        />
      )}

      <PendingBalancesList
        pendingBalances={pendingBalances}
        user={user}
        partnerUser={partnerUser}
        onSettle={handleSettle}
        onDelete={handleDelete}
        onClearHistory={handleClearHistory}
        isLoading={isLoading}
      />
    </div>
  )
}
