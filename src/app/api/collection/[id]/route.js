import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request, ctx) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const releaseId = Number(id);

  if (!Number.isInteger(releaseId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "DELETE FROM collection WHERE id = $1 AND user_id = $2",
      [releaseId, user.id]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request, ctx) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const releaseId = Number(id);

  if (!Number.isInteger(releaseId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
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

  try {
    const result = await pool.query(
      `UPDATE collection
       SET artist = $1, title = $2, format = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [artist, title, format, releaseId, user.id]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}