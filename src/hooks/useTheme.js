import { useEffect } from 'react'
import useUiStore from '../store/uiStore'

export default function useTheme() {
  const { theme, toggleTheme } = useUiStore()

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return { theme, toggleTheme }
}
