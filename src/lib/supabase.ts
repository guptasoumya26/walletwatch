import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          password_hash?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          description: string
          expense_date: string
          month: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          description?: string
          expense_date?: string
          month?: string
          created_at?: string
          updated_at?: string
        }
      }
      monthly_notes: {
        Row: {
          id: string
          user_id: string
          month: string
          note_content: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          note_content: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          note_content?: string
          updated_at?: string
        }
      }
      pending_balances: {
        Row: {
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
        Insert: {
          id?: string
          creditor_id: string
          debtor_id: string
          amount: number
          description: string
          category: string
          created_at?: string
          settled_at?: string | null
          settled_by?: string | null
          created_by: string
          cleared_for?: string[] | null
        }
        Update: {
          id?: string
          creditor_id?: string
          debtor_id?: string
          amount?: number
          description?: string
          category?: string
          created_at?: string
          settled_at?: string | null
          settled_by?: string | null
          created_by?: string
          cleared_for?: string[] | null
        }
      }
      health_checks: {
        Row: {
          id: string
          checked_at: string
          status: string
          message: string | null
          response_time_ms: number | null
        }
        Insert: {
          id?: string
          checked_at?: string
          status?: string
          message?: string | null
          response_time_ms?: number | null
        }
        Update: {
          id?: string
          checked_at?: string
          status?: string
          message?: string | null
          response_time_ms?: number | null
        }
      }
    }
  }
}