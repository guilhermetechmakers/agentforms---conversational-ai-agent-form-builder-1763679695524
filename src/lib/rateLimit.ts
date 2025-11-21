/**
 * Rate Limiting Utilities
 * Client-side rate limiting for session interactions
 */

interface RateLimitState {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_STORAGE_KEY = 'agentforms_rate_limit';
const DEFAULT_LIMITS = {
  messages: { max: 30, window: 60 * 1000 }, // 30 messages per minute
  sessions: { max: 5, window: 60 * 60 * 1000 }, // 5 sessions per hour
  requests: { max: 100, window: 60 * 1000 }, // 100 requests per minute
};

export interface RateLimitConfig {
  max: number;
  window: number; // in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number; // seconds until next request allowed
}

/**
 * Check if an action is allowed based on rate limits
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_LIMITS.messages
): RateLimitResult {
  const now = Date.now();
  const storageKey = `${RATE_LIMIT_STORAGE_KEY}_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    let state: RateLimitState;
    
    if (stored) {
      state = JSON.parse(stored);
      
      // Reset if window has passed
      if (now >= state.resetAt) {
        state = {
          count: 0,
          resetAt: now + config.window,
        };
      }
    } else {
      state = {
        count: 0,
        resetAt: now + config.window,
      };
    }
    
    const allowed = state.count < config.max;
    
    if (allowed) {
      state.count += 1;
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
    
    const remaining = Math.max(0, config.max - state.count);
    const retryAfter = allowed ? undefined : Math.ceil((state.resetAt - now) / 1000);
    
    return {
      allowed,
      remaining,
      resetAt: state.resetAt,
      retryAfter,
    };
  } catch (error) {
    // If localStorage fails, allow the request (graceful degradation)
    console.warn('Rate limit check failed:', error);
    return {
      allowed: true,
      remaining: config.max,
      resetAt: now + config.window,
    };
  }
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
  const storageKey = `${RATE_LIMIT_STORAGE_KEY}_${key}`;
  localStorage.removeItem(storageKey);
}

/**
 * Get rate limit status without incrementing
 */
export function getRateLimitStatus(
  key: string,
  config: RateLimitConfig = DEFAULT_LIMITS.messages
): RateLimitResult {
  const now = Date.now();
  const storageKey = `${RATE_LIMIT_STORAGE_KEY}_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return {
        allowed: true,
        remaining: config.max,
        resetAt: now + config.window,
      };
    }
    
    const state: RateLimitState = JSON.parse(stored);
    
    // Reset if window has passed
    if (now >= state.resetAt) {
      return {
        allowed: true,
        remaining: config.max,
        resetAt: now + config.window,
      };
    }
    
    const remaining = Math.max(0, config.max - state.count);
    const retryAfter = state.count >= config.max
      ? Math.ceil((state.resetAt - now) / 1000)
      : undefined;
    
    return {
      allowed: state.count < config.max,
      remaining,
      resetAt: state.resetAt,
      retryAfter,
    };
  } catch (error) {
    console.warn('Rate limit status check failed:', error);
    return {
      allowed: true,
      remaining: config.max,
      resetAt: now + config.window,
    };
  }
}

/**
 * Check for abuse patterns
 */
export function detectAbusePattern(
  messages: Array<{ content: string; createdAt: string }>,
  threshold: number = 10
): { isAbuse: boolean; reason?: string } {
  const now = Date.now();
  const recentMessages = messages.filter(msg => {
    const msgTime = new Date(msg.createdAt).getTime();
    return now - msgTime < 60 * 1000; // Last minute
  });
  
  // Check for rapid-fire messages
  if (recentMessages.length > threshold) {
    return {
      isAbuse: true,
      reason: 'Too many messages in a short time',
    };
  }
  
  // Check for repetitive content
  const contents = recentMessages.map(m => m.content.toLowerCase().trim());
  const uniqueContents = new Set(contents);
  if (contents.length > 5 && uniqueContents.size < 2) {
    return {
      isAbuse: true,
      reason: 'Repetitive message pattern detected',
    };
  }
  
  // Check for very short messages (potential spam)
  const shortMessages = recentMessages.filter(m => m.content.trim().length < 3);
  if (shortMessages.length > 5) {
    return {
      isAbuse: true,
      reason: 'Too many very short messages',
    };
  }
  
  return { isAbuse: false };
}
