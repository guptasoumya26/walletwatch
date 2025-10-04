'use client'

import { Check, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useState } from 'react'
import { PendingBalance, User } from '@/lib/types'

interface PendingBalancesListProps {
  pendingBalances: PendingBalance[]
  user: User
  partnerUser: User
  onSettle: (id: string) => void
  onDelete: (id: string) => void
  onClearHistory: () => void
  isLoading: boolean
}

export default function PendingBalancesList({
  pendingBalances,
  user,
  partnerUser,
  onSettle,
  onDelete,
  onClearHistory,
  isLoading,
}: PendingBalancesListProps) {
  const [showSettled, setShowSettled] = useState(false)

  const activeBalances = pendingBalances.filter((pb) => !pb.settled_at)

  // Filter settled balances: only show if NOT cleared for current user
  const settledBalances = pendingBalances.filter((pb) => {
    if (!pb.settled_at) return false
    const clearedFor = pb.cleared_for || []
    return !clearedFor.includes(user.id)
  })

  const getBalanceDirection = (balance: PendingBalance) => {
    if (balance.creditor_id === user.id) {
      return {
        message: `${partnerUser.username} owes you`,
        type: 'owed' as const,
      }
    } else {
      return {
        message: `You owe ${partnerUser.username}`,
        type: 'owes' as const,
      }
    }
  }

  const canDelete = (balance: PendingBalance) => {
    return balance.created_by === user.id && !balance.settled_at
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading pending balances...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Pending Balances */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
          Active Pending Balances
        </h4>
        {activeBalances.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No active pending balances</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBalances.map((balance) => {
              const direction = getBalanceDirection(balance)
              return (
                <div
                  key={balance.id}
                  className={`p-4 border rounded-lg ${
                    direction.type === 'owed'
                      ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className={`font-semibold ${
                          direction.type === 'owed'
                            ? 'text-blue-900 dark:text-blue-200'
                            : 'text-red-900 dark:text-red-200'
                        }`}>
                          {direction.message}
                        </p>
                        <p className={`text-xl font-bold ${
                          direction.type === 'owed'
                            ? 'text-blue-900 dark:text-blue-200'
                            : 'text-red-900 dark:text-red-200'
                        }`}>
                          ₹{balance.amount.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        {balance.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {balance.category}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(balance.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => onSettle(balance.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      <span>Mark as Settled</span>
                    </button>
                    {canDelete(balance) && (
                      <button
                        onClick={() => onDelete(balance.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Settled Balances History */}
      {settledBalances.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowSettled(!showSettled)}
              className="flex items-center space-x-2 text-md font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span>Settled History ({settledBalances.length})</span>
              {showSettled ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={() => {
                if (confirm('Clear your settled history? Records will be archived for admin review only. This cannot be undone.')) {
                  onClearHistory()
                }
              }}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear History</span>
            </button>
          </div>

          {showSettled && (
            <div className="space-y-3">
              {settledBalances.map((balance) => {
                const direction = getBalanceDirection(balance)
                return (
                  <div
                    key={balance.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-lg opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-700 dark:text-gray-300">
                            {direction.message}
                          </p>
                          <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                            ₹{balance.amount.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {balance.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                            {balance.category}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <p>Created: {new Date(balance.created_at).toLocaleDateString()}</p>
                            <p className="text-green-600 dark:text-green-400">
                              ✓ Settled: {balance.settled_at ? new Date(balance.settled_at).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
