/**
 * Rate limiter for Freesound API
 * Limits: 60 requests/minute, 2000 requests/day
 */

// Use 59 instead of 60 to leave a safety margin
const REQUESTS_PER_MINUTE = 59;
const REQUESTS_PER_DAY = 2000;
const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

interface QueuedRequest {
  execute: () => void;
  timestamp: number;
}

class RateLimiter {
  private requestTimestamps: number[] = [];
  private requestQueue: QueuedRequest[] = [];
  private processingQueue = false;

  /**
   * Check if we can make a request now, or if we need to wait
   */
  private canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < MINUTE_MS
    );
    
    // Check per-minute limit
    if (this.requestTimestamps.length >= REQUESTS_PER_MINUTE) {
      return false;
    }
    
    // Check per-day limit (approximate - resets daily)
    const dayStart = now - (now % DAY_MS);
    const requestsToday = this.requestTimestamps.filter((ts) => ts >= dayStart).length;
    if (requestsToday >= REQUESTS_PER_DAY) {
      return false;
    }
    
    return true;
  }

  /**
   * Get the delay needed before next request
   */
  private getDelayUntilNextRequest(): number {
    if (this.requestTimestamps.length === 0) {
      return 0;
    }
    
    const oldestTimestamp = this.requestTimestamps[0];
    const now = Date.now();
    const timeSinceOldest = now - oldestTimestamp;
    
    if (timeSinceOldest >= MINUTE_MS) {
      return 0;
    }
    
    // Calculate delay to ensure we don't exceed 60/minute
    // Spread requests evenly across the minute
    const delayPerRequest = MINUTE_MS / REQUESTS_PER_MINUTE;
    const nextAvailableTime = oldestTimestamp + delayPerRequest;
    return Math.max(0, nextAvailableTime - now);
  }

  /**
   * Record a request timestamp
   */
  private recordRequest(): void {
    const now = Date.now();
    this.requestTimestamps.push(now);
    
    // Keep only recent timestamps (last 2 minutes for safety)
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < 2 * MINUTE_MS
    );
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    while (this.requestQueue.length > 0) {
      if (!this.canMakeRequest()) {
        const delay = this.getDelayUntilNextRequest();
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      const request = this.requestQueue.shift();
      if (request) {
        this.recordRequest();
        request.execute();
      }
    }

    this.processingQueue = false;
  }

  /**
   * Execute a request with rate limiting
   */
  async executeRequest<T>(requestFn: () => Promise<T> | T): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (this.canMakeRequest()) {
        this.recordRequest();
        execute();
      } else {
        // Queue the request
        const delay = this.getDelayUntilNextRequest();
        this.requestQueue.push({
          execute: () => {
            setTimeout(() => {
              this.recordRequest();
              execute();
            }, delay);
          },
          timestamp: Date.now(),
        });
        this.processQueue();
      }
    });
  }

  /**
   * Get current request count in the last minute
   */
  getRequestCount(): number {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < MINUTE_MS
    );
    return this.requestTimestamps.length;
  }

  /**
   * Clear all timestamps (useful for testing or reset)
   */
  reset(): void {
    this.requestTimestamps = [];
    this.requestQueue = [];
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

