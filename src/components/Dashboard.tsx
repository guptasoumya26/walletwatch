'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { User } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { formatMonth, getPreviousMonth, getNextMonth } from '@/lib/auth'
import { ChevronLeft, ChevronRight, LogOut, Plus, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'
import BalanceCalculator from './BalanceCalculator'
import NotesSection from './NotesSection'
import ExpenseChart from './ExpenseChart'

interface DashboardProps {
  user: User
  currentMonth: string
  setCurrentMonth: (month: string) => void
}

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

export default function Dashboard({ user, currentMonth, setCurrentMonth }: DashboardProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch(`/api/expenses?month=${currentMonth}`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handlePreviousMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth))
  }

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth))
  }

  const handleExpenseAdded = () => {
    fetchExpenses()
    setShowExpenseForm(false)
    setEditingExpense(null)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setShowExpenseForm(true)
  }

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const userExpenses = expenses.filter(expense => expense.user_id === user.id)
  const otherUserExpenses = expenses.filter(expense => expense.user_id !== user.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="debug-theme"></div>
      <div className="max-w-6xl mx-auto p-4">
        <header className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              WalletWatch
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user.username}!
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Security</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {formatMonth(currentMonth)}
            </h2>

            <button
              onClick={handleNextMonth}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {showExpenseForm && (
          <ExpenseForm
            user={user}
            currentMonth={currentMonth}
            editingExpense={editingExpense}
            onClose={() => {
              setShowExpenseForm(false)
              setEditingExpense(null)
            }}
            onExpenseAdded={handleExpenseAdded}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ExpenseList
            title={`${user.username}'s Expenses`}
            expenses={userExpenses}
            canEdit={true}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            isLoading={isLoading}
          />

          <ExpenseList
            title="Partner's Expenses"
            expenses={otherUserExpenses}
            canEdit={false}
            onEdit={() => {}}
            onDelete={() => {}}
            isLoading={isLoading}
          />
        </div>

        <BalanceCalculator
          userExpenses={userExpenses}
          otherUserExpenses={otherUserExpenses}
          currentUser={user.username}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <NotesSection
            user={user}
            currentMonth={currentMonth}
          />

          <ExpenseChart
            currentMonth={currentMonth}
          />
        </div>
      </div>
    </div>
  )
}