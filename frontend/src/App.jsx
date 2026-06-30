import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/index.jsx'
import useUiStore from './store/uiStore'
import { useEffect } from 'react'

function App() {
  const { theme, toggleTheme } = useUiStore()

  useEffect(() => {
    console.log('Current theme:', theme)
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  )
}

export default App
