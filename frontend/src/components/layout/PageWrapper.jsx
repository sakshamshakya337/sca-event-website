import Sidebar from './Sidebar'
import Navbar from './Navbar'
import useUiStore from '../../store/uiStore'

export default function PageWrapper({ children }) {
  const { sidebarOpen } = useUiStore()
  
  return (
    <>
      <Sidebar />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-[240px]' : 'ml-0'}`}>
        <Navbar />
        <main className="p-6 flex flex-col gap-6">
          {children}
        </main>
        <footer className="mt-auto px-6 py-6 border-t border-outline-variant text-center flex flex-col items-center gap-1">
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60">
            © 2026 SCA - School of Computer Application
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60">
            Developed and maintained by - <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:underline">Saksham shakya</a>
          </p>
        </footer>
      </div>
    </>
  )
}
