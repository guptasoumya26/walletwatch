'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import { User } from '@/lib/types'

interface PendingBalanceFormProps {
  user: User
  partnerUser: User
  onClose: () => void
  onBalanceAdded: () => void
}

export default function PendingBalanceForm({
  user,
  partnerUser,
  onClose,
  onBalanceAdded,
}: PendingBalanceFormProps) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [direction, setDirection] = useState<'partner_owes_me' | 'i_owe_partner'>('partner_owes_me')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const creditor_id = direction === 'partner_owes_me' ? user.id : partnerUser.id
      const debtor_id = direction === 'partner_owes_me' ? partnerUser.id : user.id

      const response = await fetch('/api/pending-balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditor_id,
          debtor_id,
          amount: parseFloat(amount),
          description,
          category,
          created_by: user.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to add pending balance')
        return
      }

      onBalanceAdded()
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Pending balance form error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPreviewMessage = () => {
    if (!amount || parseFloat(amount) <= 0) return ''

    const formattedAmount = `₹${parseFloat(amount).toFixed(2)}`

    if (direction === 'partner_owes_me') {
      return `${partnerUser.username} will owe you ${formattedAmount}`
    } else {
      return `You will owe ${partnerUser.username} ${formattedAmount}`
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Pending Balance
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Who owes whom?
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="direction"
                  value="partner_owes_me"
                  checked={direction === 'partner_owes_me'}
                  onChange={(e) => setDirection(e.target.value as 'partner_owes_me' | 'i_owe_partner')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-900 dark:text-white">
                  {partnerUser.username} owes me
                </span>
              </label>
              <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="direction"
                  value="i_owe_partner"
                  checked={direction === 'i_owe_partner'}
                  onChange={(e) => setDirection(e.target.value as 'partner_owes_me' | 'i_owe_partner')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-900 dark:text-white">
                  I owe {partnerUser.username}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (₹)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Category</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Gym membership fee"
            />
          </div>

          {getPreviewMessage() && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-md">
              <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">
                Preview: {getPreviewMessage()}
              </p>
            </div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
