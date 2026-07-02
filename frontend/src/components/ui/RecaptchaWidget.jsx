import { forwardRef, useImperativeHandle, useRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { ShieldCheck } from 'lucide-react'

/**
 * Reusable hCaptcha widget — drop-in replacement for the old reCAPTCHA widget.
 *
 * Props:
 *   onChange  (fn)     — called with token string on success, null on expire/error
 *   theme     (string) — 'light' | 'dark'  (default: 'light')
 *   className (string) — extra wrapper classes
 *
 * Usage:
 *   const captchaRef = useRef(null)
 *   <RecaptchaWidget ref={captchaRef} onChange={setToken} />
 *
 *   // reset after failed submit:
 *   captchaRef.current?.reset()
 */
const RecaptchaWidget = forwardRef(function RecaptchaWidget(
  { onChange, theme = 'light', className = '' },
  ref
) {
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY
  const captchaRef = useRef(null)

  // Expose a .reset() method identical to the old reCAPTCHA ref API
  useImperativeHandle(ref, () => ({
    reset: () => {
      captchaRef.current?.resetCaptcha()
      onChange(null)
    },
  }))

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#74777f]" />
        <span className="text-xs font-semibold text-[#74777f] uppercase tracking-widest">
          Security Verification
        </span>
      </div>

      {/* hCaptcha widget */}
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        theme={theme}
        onVerify={onChange}
        onExpire={() => onChange(null)}
        onError={() => onChange(null)}
      />
    </div>
  )
})

export default RecaptchaWidget
