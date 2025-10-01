// api/_rate.js
const buckets = new Map();

/**
 * Simple sliding-window limiter
 * @param {string} key
 * @param {number} max - max hits in window
 * @param {number} windowMs - window length
 * @returns {boolean} allowed
 */
export function rateLimit(key, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key) || { hits: [] };
  b.hits = b.hits.filter(t => now - t < windowMs);
  b.hits.push(now);
  buckets.set(key, b);
  return b.hits.length <= max;
}