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
    }
  }
}