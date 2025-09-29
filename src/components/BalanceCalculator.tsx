'use client'

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
}

export default function BalanceCalculator({
  userExpenses,
  otherUserExpenses,
  currentUser,
}: BalanceCalculatorProps) {
  const userTotal = userExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const otherUserTotal = otherUserExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const grandTotal = userTotal + otherUserTotal
  const equalShare = grandTotal / 2
  const userBalance = userTotal - equalShare
  const otherUserName = currentUser === 'Soumyansh' ? 'Anu' : 'Soumyansh'

  const getBalanceMessage = () => {
    if (Math.abs(userBalance) < 0.01) {
      return {
        message: "Expenses are perfectly balanced! 🎉",
        amount: 0,
        type: 'balanced'
      }
    } else if (userBalance > 0) {
      return {
        message: `${otherUserName} owes you`,
        amount: Math.abs(userBalance),
        type: 'owed'
      }
    } else {
      return {
        message: `You owe ${otherUserName}`,
        amount: Math.abs(userBalance),
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
            Equal Share Each
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ₹{equalShare.toFixed(2)}
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
                <span className="block text-xl font-bold mt-1">
                  ₹{balance.amount.toFixed(2)}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}