// Server-side hCaptcha verification (shared helper).
// Validates the client token against hCaptcha's siteverify endpoint.
const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY
const SITEVERIFY_URL = 'https://hcaptcha.com/siteverify'

/**
 * Verify an hCaptcha token.
 * @param {string} token - The token returned by the hCaptcha widget.
 * @param {string} [remoteIp] - Optional client IP forwarded by the proxy.
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const verifyHCaptcha = async (token, remoteIp) => {
  if (!token) {
    return { success: false, error: 'Captcha token missing' }
  }

  // Fail closed in production if the secret is not configured.
  if (!HCAPTCHA_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ HCAPTCHA_SECRET_KEY missing — cannot verify captcha')
      return { success: false, error: 'Captcha misconfigured' }
    }
    console.warn('⚠️ HCAPTCHA_SECRET_KEY missing — skipping captcha verification (dev only)')
    return { success: true }
  }

  try {
    const body = new URLSearchParams({ secret: HCAPTCHA_SECRET, response: token })
    if (remoteIp) body.append('remoteip', remoteIp)

    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    const data = await res.json()
    if (!data.success) {
      return { success: false, error: (data['error-codes'] || []).join(', ') }
    }
    return { success: true }
  } catch (err) {
    console.error('❌ hCaptcha verification request failed:', err.message)
    // Fail closed on transport errors only in production.
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Captcha verification failed' }
    }
    return { success: true }
  }
}

export default verifyHCaptcha
