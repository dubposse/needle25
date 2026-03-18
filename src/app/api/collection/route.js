import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const artist = searchParams.get("artist")?.trim() || "";
  const format = searchParams.get("format")?.trim() || "";
  const sort = searchParams.get("sort")?.trim() || "newest";

  let query = "SELECT * FROM collection WHERE user_id = $1";
  const values = [user.id];
  let paramIndex = 2;

  if (artist) {
    query += ` AND artist ILIKE $${paramIndex}`;
    values.push(`%${artist}%`);
    paramIndex++;
  }

  if (format) {
    query += ` AND format = $${paramIndex}`;
    values.push(format);
    paramIndex++;
  }

  if (sort === "oldest") {
    query += " ORDER BY created_at ASC";
  } else if (sort === "artist_asc") {
    query += " ORDER BY artist ASC";
  } else {
    query += " ORDER BY created_at DESC";
  }

  const result = await pool.query(query, values);

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
  const format = body.format?.trim();

  if (!artist || !title || !format) {
    return Response.json(
      { error: "Artist, title and format are required" },
      { status: 400 }
    );
  }

  const result = await pool.query(
    `INSERT INTO collection (artist, title, format, user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [artist, title, format, user.id]
  );

  return Response.json(result.rows[0], { status: 201 });
}