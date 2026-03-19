import pool from "@/lib/db";

export async function GET(request, ctx) {
  const { genre } = await ctx.params;
  const normalizedGenre = genre?.trim().toLowerCase();

  if (!normalizedGenre) {
    return Response.json({ error: "Invalid genre" }, { status: 400 });
  }

  const result = await pool.query(
    `
    SELECT DISTINCT users.username
    FROM users
    JOIN charts ON charts.user_id = users.id
    WHERE (users.favorite_genre_1 = $1 OR users.favorite_genre_2 = $1)
      AND charts.is_public = true
    ORDER BY users.username ASC
    `,
    [normalizedGenre]
  );

  return Response.json(result.rows);
}