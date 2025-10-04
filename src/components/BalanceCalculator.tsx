'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PendingBalance } from '@/lib/types'

interface Expense {
  id: string
  user_id: string
  amount: number
  category: string
  description: string
  expense_date: string
  month: string
  created_at: string
  updated_at: string
}

interface BalanceCalculatorProps {
  userExpenses: Expense[]
  otherUserExpenses: Expense[]
  currentUser: string
  userId: string
}

export default function BalanceCalculator({
  userExpenses,
  otherUserExpenses,
  currentUser,
  userId,
}: BalanceCalculatorProps) {
  const [pendingBalances, setPendingBalances] = useState<PendingBalance[]>([])
  const [showPendingDetails, setShowPendingDetails] = useState(false)
  const [isLoadingPending, setIsLoadingPending] = useState(true)

  const userTotal = userExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const otherUserTotal = otherUserExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const grandTotal = userTotal + otherUserTotal
  const equalShare = grandTotal / 2
  const sharedBalance = userTotal - equalShare
  const otherUserName = currentUser === 'Soumyansh' ? 'Anu' : 'Soumyansh'

  // Fetch active pending balances
  useEffect(() => {
    const fetchPendingBalances = async () => {
      try {
        const response = await fetch('/api/pending-balances?status=active')
        if (response.ok) {
          const data = await response.json()
          setPendingBalances(data.pendingBalances || [])
        }
      } catch (error) {
        console.error('Error fetching pending balances:', error)
      } finally {
        setIsLoadingPending(false)
      }
    }

    fetchPendingBalances()
  }, [])

  // Calculate pending balance amounts
  const userPendingCredit = pendingBalances
    .filter((pb) => pb.creditor_id === userId && !pb.settled_at)
    .reduce((sum, pb) => sum + pb.amount, 0)

  const userPendingDebt = pendingBalances
    .filter((pb) => pb.debtor_id === userId && !pb.settled_at)
    .reduce((sum, pb) => sum + pb.amount, 0)

  const netPendingBalance = userPendingCredit - userPendingDebt
  const totalSettlement = sharedBalance + netPendingBalance

  const activePendingForUser = pendingBalances.filter(
    (pb) => !pb.settled_at && (pb.creditor_id === userId || pb.debtor_id === userId)
  )

  const getBalanceMessage = () => {
    if (Math.abs(totalSettlement) < 0.01) {
      return {
        message: "Everything is perfectly balanced! 🎉",
        amount: 0,
        type: 'balanced'
      }
    } else if (totalSettlement > 0) {
      return {
        message: `${otherUserName} owes you`,
        amount: Math.abs(totalSettlement),
        type: 'owed'
      }
    } else {
      return {
        message: `You owe ${otherUserName}`,
        amount: Math.abs(totalSettlement),
        type: 'owes'
      }
    }
  }

  const balance = getBalanceMessage()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Balance Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {currentUser}&apos;s Total
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{userTotal.toFixed(2)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {otherUserName}&apos;s Total
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₹{otherUserTotal.toFixed(2)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Grand Total
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{grandTotal.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Equal Share Each (Shared Expenses)
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ₹{equalShare.toFixed(2)}
          </p>

          {/* Shared Expenses Balance */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Shared Expenses Balance
            </p>
            <p className={`text-lg font-semibold ${
              Math.abs(sharedBalance) < 0.01
                ? 'text-gray-600 dark:text-gray-400'
                : sharedBalance > 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {Math.abs(sharedBalance) < 0.01
                ? '₹0.00 (Balanced)'
                : sharedBalance > 0
                ? `${otherUserName} owes: ₹${Math.abs(sharedBalance).toFixed(2)}`
                : `You owe: ₹${Math.abs(sharedBalance).toFixed(2)}`}
            </p>
          </div>

          {/* Pending Balances */}
          {!isLoadingPending && activePendingForUser.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowPendingDetails(!showPendingDetails)}
                className="w-full p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                      Pending Balances
                    </p>
                    <p className={`text-lg font-semibold ${
                      Math.abs(netPendingBalance) < 0.01
                        ? 'text-gray-600 dark:text-gray-400'
                        : netPendingBalance > 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {netPendingBalance >= 0 ? '+' : ''}₹{netPendingBalance.toFixed(2)}
                    </p>
                  </div>
                  {showPendingDetails ? (
                    <ChevronUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
              </button>

              {showPendingDetails && (
                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg space-y-2">
                  {activePendingForUser.map((pb) => {
                    const isCreditor = pb.creditor_id === userId
                    return (
                      <div
                        key={pb.id}
                        className="text-sm p-2 bg-white dark:bg-gray-800 rounded border border-purple-200 dark:border-purple-800"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">
                            {pb.description}
                          </span>
                          <span className={`font-semibold ${
                            isCreditor
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {isCreditor ? '+' : '-'}₹{pb.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Total Settlement */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold">
              Total Settlement Amount
            </p>
            <div className={`p-4 rounded-lg ${
              balance.type === 'balanced'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : balance.type === 'owed'
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-lg font-semibold ${
                balance.type === 'balanced'
                  ? 'text-green-800 dark:text-green-200'
                  : balance.type === 'owed'
                  ? 'text-blue-800 dark:text-blue-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {balance.message}
                {balance.amount > 0 && (
                  <span className="block text-2xl font-bold mt-1">
                    ₹{balance.amount.toFixed(2)}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}