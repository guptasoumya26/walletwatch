'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      console.log('Theme Debug:', { theme, resolvedTheme, systemTheme })
    }
  }, [theme, resolvedTheme, systemTheme, mounted])

  if (!mounted) {
    return null
  }

  const handleToggle = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    console.log('Toggling theme from', resolvedTheme, 'to', newTheme)
    setTheme(newTheme)
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
      title={`Current theme: ${resolvedTheme || theme}`}
    >
      {(resolvedTheme || theme) === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  )
}