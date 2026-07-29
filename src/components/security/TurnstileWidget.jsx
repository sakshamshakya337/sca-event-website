import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { ShieldCheck } from 'lucide-react'

/**
 * Reusable Cloudflare Turnstile widget — with optimized skeleton loading to prevent layout shifts.
 */
const TurnstileWidget = forwardRef(function TurnstileWidget(
  { onChange, theme = 'light', className = '' },
  ref
) {
  // Use the Site Key provided for this project
  const siteKey = '0x4AAAAAAEA0RPHUDuE2Zjcr'
  
  const captchaRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Expose a .reset() method to match old widget behavior
  useImperativeHandle(ref, () => ({
    reset: () => {
      captchaRef.current?.reset()
      onChange(null)
    },
  }))

  const handleLoad = () => {
    setIsLoaded(true)
  }

  // Defensive fallback: hide skeleton loader after 2.5 seconds if onLoad doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#74777f]" />
        <span className="text-xs font-semibold text-[#74777f] uppercase tracking-widest">
          Security Verification
        </span>
      </div>

      <div className="relative min-h-[65px] w-[300px]">
        {/* Skeleton Loader placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-between px-4 border border-[#e1e2ec] rounded bg-[#f9fafc] animate-pulse z-10">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border-2 border-dashed border-[#74777f] animate-spin"></div>
              <div className="flex flex-col gap-1">
                <div className="h-2 w-24 bg-[#e1e2ec] rounded"></div>
                <div className="h-1.5 w-14 bg-[#e1e2ec] rounded"></div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-[#e1e2ec] rounded-sm"></div>
            </div>
          </div>
        )}

        {/* Turnstile widget container */}
        <div className="w-full h-full" onLoad={handleLoad}>
          <Turnstile
            ref={captchaRef}
            siteKey={siteKey}
            options={{
              theme,
              action: 'form_submit',
            }}
            onSuccess={(token) => {
              setIsLoaded(true)
              onChange(token)
            }}
            onExpire={() => onChange(null)}
            onError={() => onChange(null)}
          />
        </div>
      </div>
    </div>
  )
})

export default TurnstileWidget
