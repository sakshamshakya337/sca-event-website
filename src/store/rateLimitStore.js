import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useRateLimitStore = create(
  persist(
    (set) => ({
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
    }),
    {
      name: 'rate-limit-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export default useRateLimitStore