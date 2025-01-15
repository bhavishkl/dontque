'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    // Dispatch custom event for theme change
    window.dispatchEvent(new Event('themeChange'))
  }

  if (!mounted) {
    return null
  }

  return (
    <button 
      onClick={handleThemeChange}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-yellow-400 bg-black-100 rounded-full" />
      ) : (
        <Moon size={20} />
      )}
    </button>
  )
}