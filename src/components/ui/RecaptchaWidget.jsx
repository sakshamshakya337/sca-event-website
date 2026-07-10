import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { ShieldCheck } from 'lucide-react'

/**
 * Reusable hCaptcha widget — with optimized skeleton loading to prevent layout shifts
 * and speed up perceived load time.
 */
const RecaptchaWidget = forwardRef(function RecaptchaWidget(
  { onChange, theme = 'light', className = '' },
  ref
) {
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY
  const captchaRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Expose a .reset() method identical to the old reCAPTCHA ref API
  useImperativeHandle(ref, () => ({
    reset: () => {
      captchaRef.current?.resetCaptcha()
      onChange(null)
    },
  }))

  const handleLoad = () => {
    setIsLoaded(true)
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#74777f]" />
        <span className="text-xs font-semibold text-[#74777f] uppercase tracking-widest">
          Security Verification
        </span>
      </div>

      <div className="relative min-h-[78px] w-[302px]">
        {/* Skeleton Loader placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-between px-4 border border-[#e1e2ec] rounded bg-[#f9fafc] animate-pulse z-10">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded border-2 border-dashed border-[#74777f] animate-spin"></div>
              <div className="flex flex-col gap-1">
                <div className="h-3 w-28 bg-[#e1e2ec] rounded"></div>
                <div className="h-2 w-16 bg-[#e1e2ec] rounded"></div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 bg-[#e1e2ec] rounded-full"></div>
              <div className="h-1.5 w-10 bg-[#e1e2ec] rounded"></div>
            </div>
          </div>
        )}

        {/* hCaptcha widget container */}
        <div className="w-full h-full">
          <HCaptcha
            ref={captchaRef}
            sitekey={siteKey}
            theme={theme}
            onLoad={handleLoad}
            onVerify={onChange}
            onExpire={() => onChange(null)}
            onError={() => onChange(null)}
          />
        </div>
      </div>
    </div>
  )
})

export default RecaptchaWidget
