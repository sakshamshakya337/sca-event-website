import Sidebar from './Sidebar'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import useUiStore from '../../store/uiStore'

export default function PageWrapper({ children }) {
  const { sidebarOpen } = useUiStore()

  return (
    <>
      <Sidebar />
      {/*
        Mobile (< lg): sidebar slides over content → no left margin ever
        Desktop (≥ lg): sidebar is always visible → shift content right
      */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-[240px]' : 'lg:ml-[64px]'
      }`}>
        <Navbar />
        {/* Added pb-20 on mobile to account for BottomNav */}
        <main className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 pb-20 lg:pb-6">
          {children}
        </main>
        <footer className="mt-auto px-4 sm:px-6 py-5 border-t border-outline-variant text-center pb-24 lg:pb-5">
          <p className="text-xs text-on-surface-variant opacity-60">
            © 2026 SCA - School of Computer Application
          </p>
          <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">
            Developed and maintained by -{' '}
            <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:underline">
              Saksham shakya
            </a>
          </p>
        </footer>
      </div>
      <BottomNav />
    </>
  )
}
