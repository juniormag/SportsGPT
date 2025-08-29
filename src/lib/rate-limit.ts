/**
 * Rate Limiting Utilities
 * Simple client-side rate limiting to prevent spam
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  /**
   * Check if request is allowed for given identifier
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const entry = this.storage.get(identifier)

    // No previous entry, allow and create new one
    if (!entry) {
      this.storage.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    // Reset window if expired
    if (now >= entry.resetTime) {
      this.storage.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    // Check if under limit
    if (entry.count < this.maxRequests) {
      entry.count++
      return true
    }

    // Rate limited
    return false
  }

  /**
   * Get remaining time until reset (in seconds)
   */
  getResetTime(identifier: string): number {
    const entry = this.storage.get(identifier)
    if (!entry) return 0

    const now = Date.now()
    if (now >= entry.resetTime) return 0

    return Math.ceil((entry.resetTime - now) / 1000)
  }

  /**
   * Get remaining requests for identifier
   */
  getRemainingRequests(identifier: string): number {
    const entry = this.storage.get(identifier)
    if (!entry) return this.maxRequests

    const now = Date.now()
    if (now >= entry.resetTime) return this.maxRequests

    return Math.max(0, this.maxRequests - entry.count)
  }

  /**
   * Clear expired entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.storage.entries()) {
      if (now >= entry.resetTime) {
        this.storage.delete(key)
      }
    }
  }
}

// Create global rate limiter instance
export const chatRateLimiter = new RateLimiter(60000, 10) // 10 requests per minute

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    chatRateLimiter.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * Get user identifier for rate limiting
 * Uses IP simulation based on browser fingerprint
 */
export function getUserIdentifier(): string {
  if (typeof window === 'undefined') return 'server'
  
  // Create a simple browser fingerprint
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ].join('|')
  
  // Create a simple hash
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString()
}

/**
 * Check if chat request is allowed
 */
export function isChatAllowed(): {
  allowed: boolean
  resetTime?: number
  remaining?: number
} {
  const identifier = getUserIdentifier()
  const allowed = chatRateLimiter.isAllowed(identifier)
  
  if (allowed) {
    return {
      allowed: true,
      remaining: chatRateLimiter.getRemainingRequests(identifier)
    }
  }
  
  return {
    allowed: false,
    resetTime: chatRateLimiter.getResetTime(identifier),
    remaining: 0
  }
}
