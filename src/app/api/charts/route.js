import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pool.query(
    "SELECT * FROM charts WHERE user_id = $1 ORDER BY category ASC, id DESC",
    [user.id]
  );

  return Response.json(result.rows);
}

export async function POST(request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const artist = body.artist?.trim();
  const title = body.title?.trim();
  const category = body.category?.trim();
  const comment = body.comment?.trim() || "";

  const allowedCategories = ["alltime", "current", "recommendation"];

  if (!artist || !title || !category) {
    return Response.json(
      { error: "Artist, title and category are required" },
      { status: 400 }
    );
  }

  if (!allowedCategories.includes(category)) {
    return Response.json({ error: "Invalid category" }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO charts (artist, title, category, comment, is_public, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [artist, title, category, comment, true, user.id]
  );

  return Response.json(result.rows[0], { status: 201 });
}