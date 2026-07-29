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
        <div className="p-5 border border-[#c4c6cf] rounded-2xl shadow-2xl bg-white/90 backdrop-blur-xl text-left w-full sm:w-80">
          <div className="mb-4 text-sm text-[#171c1f] font-medium leading-relaxed">
            { offlineReady
              ? <span>The app is ready to work offline.</span>
              : <span>A new version is available. Update now?</span>
            }
          </div>
          <div className="flex justify-end gap-2">
            <button 
              className="border border-[#c4c6cf] px-4 py-2 text-sm font-semibold rounded-xl hover:bg-[#f0f4f8] text-[#43474e] transition-colors" 
              onClick={() => close()}
            >
              Close
            </button>
            { needRefresh && (
              <button 
                className="bg-primary text-white px-4 py-2 text-sm font-semibold rounded-xl hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]" 
                onClick={() => updateServiceWorker(true)}
              >
                Update Now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReloadPrompt
