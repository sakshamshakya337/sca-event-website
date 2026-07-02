import { forwardRef, useEffect, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { ShieldCheck } from 'lucide-react'

/**
 * Reusable Google reCAPTCHA v2 "I'm not a robot" widget.
 *
 * Props:
 *   onChange  (fn)     — called with token string on success, null on expire/error
 *   theme     (string) — 'light' | 'dark'  (default: 'light')
 *   className (string) — extra wrapper classes
 *
 * Usage:
 *   const recaptchaRef = useRef(null)
 *   <RecaptchaWidget ref={recaptchaRef} onChange={setToken} theme="dark" />
 *
 *   // reset after failed submit:
 *   recaptchaRef.current?.reset()
 */
const RecaptchaWidget = forwardRef(function RecaptchaWidget(
  { onChange, theme = 'light', className = '' },
  ref
) {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  // The reCAPTCHA v2 checkbox widget is always 304 × 78 px.
  // On narrow containers we scale it down proportionally so it never
  // overflows or gets clipped. We measure the wrapper, not 100vw, which
  // is more accurate inside padded cards.
  const wrapperRef = useRef(null)
  const scaleRef   = useRef(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const scaled  = scaleRef.current
    if (!wrapper || !scaled) return

    const WIDGET_W = 304
    const WIDGET_H = 78

    const apply = () => {
      const available = wrapper.offsetWidth
      if (available <= 0) return
      const scale = available >= WIDGET_W ? 1 : available / WIDGET_W
      scaled.style.transform       = `scale(${scale})`
      scaled.style.transformOrigin = 'top left'
      // Reserve the correct height so the wrapper doesn't collapse
      wrapper.style.height = `${Math.ceil(WIDGET_H * scale)}px`
    }

    apply()

    const ro = new ResizeObserver(apply)
    ro.observe(wrapper)
    return () => ro.disconnect()
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

      {/* Outer wrapper — measures available width, reserves correct height */}
      <div ref={wrapperRef} className="w-full relative" style={{ minHeight: 78 }}>
        {/* Inner wrapper — scaled to fit, no overflow-hidden so iframe renders */}
        <div ref={scaleRef} style={{ display: 'inline-block', willChange: 'transform' }}>
          <ReCAPTCHA
            ref={ref}
            sitekey={siteKey}
            onChange={onChange}
            onExpired={() => onChange(null)}
            onErrored={() => onChange(null)}
            theme={theme}
          />
        </div>
      </div>
    </div>
  )
})

export default RecaptchaWidget
