import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentMonth = searchParams.get('month')

    if (!currentMonth) {
      return NextResponse.json(
        { error: 'Month parameter is required' },
        { status: 400 }
      )
    }

    const [year, month] = currentMonth.split('-')
    const currentDate = new Date(parseInt(year), parseInt(month) - 1)

    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate)
      date.setMonth(date.getMonth() - i)
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.push(monthStr)
    }

    const chartData = await Promise.all(
      months.map(async (monthStr) => {
        const { data: expenses, error } = await supabase
          .from('expenses')
          .select('amount')
          .eq('month', monthStr)

        if (error) {
          console.error('Error fetching expenses for month', monthStr, error)
          return { month: monthStr, total: 0 }
        }

        const total = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
        return { month: monthStr, total }
      })
    )

    return NextResponse.json({ chartData })
  } catch (error) {
    console.error('Chart data API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}