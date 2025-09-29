'use client'

import { Edit, Trash2 } from 'lucide-react'

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

interface ExpenseListProps {
  title: string
  expenses: Expense[]
  canEdit: boolean
  onEdit: (expense: Expense) => void
  onDelete: (expenseId: string) => void
  isLoading: boolean
}

export default function ExpenseList({
  title,
  expenses,
  canEdit,
  onEdit,
  onDelete,
  isLoading,
}: ExpenseListProps) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            ₹{total.toFixed(2)}
          </p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {expense.description}
                  </h4>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₹{expense.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {expense.category}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {canEdit && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit expense"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}