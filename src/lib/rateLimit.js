import pool from "@/lib/db";

/**
 * DB-backed rate limiter. Works across all serverless instances.
 * @param {Request} request
 * @param {object} options
 * @param {number} options.limit   – max requests allowed in the window
 * @param {number} options.window  – window duration in milliseconds
 * @returns {Promise<{ ok: boolean, retryAfter?: number }>}
 */
export async function rateLimit(request, { limit, window: windowMs }) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const windowStart = new Date(Date.now() - windowMs);

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM login_attempts
     WHERE ip = $1 AND created_at > $2`,
    [ip, windowStart]
  );

  const count = Number(countResult.rows[0].count);

  if (count >= limit) {
    const oldestResult = await pool.query(
      `SELECT created_at FROM login_attempts
       WHERE ip = $1 AND created_at > $2
       ORDER BY created_at ASC LIMIT 1`,
      [ip, windowStart]
    );
    const oldest = new Date(oldestResult.rows[0].created_at);
    const retryAfter = Math.ceil((oldest.getTime() + windowMs - Date.now()) / 1000);
    return { ok: false, retryAfter };
  }

  await pool.query(
    `INSERT INTO login_attempts (ip) VALUES ($1)`,
    [ip]
  );

  // Clean up entries older than the window (fire and forget)
  pool.query(
    `DELETE FROM login_attempts WHERE created_at < $1`,
    [windowStart]
  );

  return { ok: true };
}
