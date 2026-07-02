import { create } from 'zustand'

const useRateLimitStore = create((set) => ({
  isRateLimited: false,
  rateLimitMessage: '',
  rateLimitRetryAfter: 60, // Default 60 seconds
  setRateLimited: (isLimited, message = '', retryAfter = 60) => 
    set({ 
      isRateLimited: isLimited, 
      rateLimitMessage: message,
      rateLimitRetryAfter: retryAfter
    }),
  resetRateLimit: () => 
    set({ 
      isRateLimited: false, 
      rateLimitMessage: '',
      rateLimitRetryAfter: 60
    }),
}))

export default useRateLimitStore