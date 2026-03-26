import pool from "@/lib/db";

export async function GET(request, ctx) {
  const { username } = await ctx.params;
  const normalizedUsername = username?.trim().toLowerCase();

  if (!normalizedUsername) {
    return Response.json({ error: "Invalid username" }, { status: 400 });
  }

  try {
    const userResult = await pool.query(
      "SELECT id, username FROM users WHERE username = $1",
      [normalizedUsername]
    );

    if (userResult.rowCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    const chartsResult = await pool.query(
      `SELECT id, artist, title, category, comment, created_at, updated_at
       FROM charts
       WHERE user_id = $1
         AND is_public = true
       ORDER BY category ASC, id DESC`,
      [user.id]
    );

    return Response.json({
      user,
      charts: chartsResult.rows,
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}