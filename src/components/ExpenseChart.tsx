'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ExpenseChartProps {
  currentMonth: string
}

interface ChartDataPoint {
  month: string
  total: number
}

export default function ExpenseChart({ currentMonth }: ExpenseChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchChartData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/chart-data?month=${currentMonth}`)

      if (response.ok) {
        const data = await response.json()
        setChartData(data.chartData || [])
      } else {
        setError('Failed to load chart data')
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
      setError('Failed to load chart data')
    } finally {
      setIsLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    fetchChartData()
  }, [fetchChartData])

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  // Ensure we always have data to display, even if all zeros
  const hasData = chartData.length > 0
  const maxValue = Math.max(...chartData.map(point => point.total))

  const data = {
    labels: chartData.map(point => formatMonthLabel(point.month)),
    datasets: [
      {
        label: 'Total Expenses',
        data: chartData.map(point => point.total),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: 'rgb(99, 102, 241)',
        pointHoverBackgroundColor: 'rgb(79, 70, 229)',
        pointHoverBorderColor: 'rgb(79, 70, 229)',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
        },
      },
      title: {
        display: true,
        text: 'Monthly Expense Trend',
        color: 'rgb(107, 114, 128)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            return `Total: ₹${context.parsed.y.toFixed(2)}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: maxValue > 0 ? undefined : 100, // Show a range even when no data
        ticks: {
          color: 'rgb(107, 114, 128)',
          callback: function(value: string | number) {
            return '₹' + value
          },
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
      },
    },
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Expense Trend
        </h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Expense Trend
        </h3>
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {maxValue === 0 && hasData && (
        <div className="mb-2 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add your first expense to see the trend!
          </p>
        </div>
      )}
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}