// Server-side Cloudflare Turnstile verification (shared helper).
// Validates the client token against Turnstile's siteverify endpoint.
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verify a Turnstile token.
 * @param {string} token - The token returned by the Turnstile widget.
 * @param {string} [remoteIp] - Optional client IP forwarded by the proxy.
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const verifyTurnstile = async (token, remoteIp) => {
  if (!token) {
    return { success: false, error: 'Captcha token missing' }
  }

  // Fail closed in production if the secret is not configured.
  if (!TURNSTILE_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ TURNSTILE_SECRET missing — cannot verify captcha')
      return { success: false, error: 'Captcha misconfigured' }
    }
    console.warn('⚠️ TURNSTILE_SECRET missing — skipping captcha verification (dev only)')
    return { success: true }
  }

  try {
    const body = new URLSearchParams({ secret: TURNSTILE_SECRET, response: token })
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
    console.error('❌ Turnstile verification request failed:', err.message)
    // Fail closed on transport errors only in production.
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Captcha verification failed' }
    }
    return { success: true }
  }
}

export default verifyTurnstile
