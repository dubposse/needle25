import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ALLOWED_FORMATS } from "@/lib/formats";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM wishlist WHERE user_id = $1 ORDER BY id DESC",
      [user.id]
    );
    return Response.json(result.rows);
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const artist = body.artist?.trim();
  const title = body.title?.trim();
  const format = body.format?.trim();

  if (!artist || !title || !format) {
    return Response.json(
      { error: "Artist, title and format are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_FORMATS.includes(format)) {
    return Response.json({ error: "Invalid format" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `INSERT INTO wishlist (artist, title, format, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [artist, title, format, user.id]
    );
    return Response.json(result.rows[0], { status: 201 });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}