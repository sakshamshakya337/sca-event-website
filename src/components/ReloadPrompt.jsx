import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered')
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="z-50 fixed bottom-4 right-4 m-0 p-0">
      { (offlineReady || needRefresh) && (
        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg bg-white dark:bg-slate-800 text-left">
          <div className="mb-3 text-sm text-slate-700 dark:text-slate-200 font-medium">
            { offlineReady
              ? <span>App ready to work offline</span>
              : <span>New version available, click on reload button to update.</span>
            }
          </div>
          <div className="flex gap-2">
            { needRefresh && (
              <button 
                className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-700 transition-colors" 
                onClick={() => updateServiceWorker(true)}
              >
                Reload
              </button>
            )}
            <button 
              className="border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors" 
              onClick={() => close()}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReloadPrompt
