// Centralized type definitions for WalletWatch

export interface User {
  id: string
  username: string
  email: string
}

export interface Expense {
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

export interface PendingBalance {
  id: string
  creditor_id: string
  debtor_id: string
  amount: number
  description: string
  category: string
  created_at: string
  settled_at: string | null
  settled_by: string | null
  created_by: string
  cleared_for: string[] | null
}

export interface MonthlyNote {
  id: string
  user_id: string
  month: string
  note_content: string
  updated_at: string
}
