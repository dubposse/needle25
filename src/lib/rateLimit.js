// Simple in-memory rate limiter (per IP, fixed window)
// Works for single-instance deployments.
const store = new Map();

/**
 * @param {Request} request
 * @param {object} options
 * @param {number} options.limit   – max requests allowed in the window
 * @param {number} options.window  – window duration in milliseconds
 * @returns {{ ok: boolean, retryAfter?: number }}
 */
export function rateLimit(request, { limit, window: windowMs }) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const key = `${request.url}:${ip}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { ok: false, retryAfter };
  }

  entry.count += 1;
  return { ok: true };
}
