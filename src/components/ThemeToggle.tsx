'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme, theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      console.log('Theme state:', { theme, resolvedTheme })
      console.log('HTML class list:', document.documentElement.classList.toString())
      console.log('HTML has dark class:', document.documentElement.classList.contains('dark'))
    }
  }, [theme, resolvedTheme, mounted])

  if (!mounted) {
    return null
  }

  const handleToggle = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    console.log('Toggling from', resolvedTheme, 'to', newTheme)
    setTheme(newTheme)

    // Check if class is applied after toggle
    setTimeout(() => {
      console.log('After toggle - HTML class list:', document.documentElement.classList.toString())
    }, 100)
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  )
}