import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request, ctx) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const itemId = Number(id);

  if (!Number.isInteger(itemId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const result = await pool.query(
    "DELETE FROM wishlist WHERE id = $1 AND user_id = $2",
    [itemId, user.id]
  );

  if (result.rowCount === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}

export async function PATCH(request, ctx) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const itemId = Number(id);

  if (!Number.isInteger(itemId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
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
    `UPDATE wishlist
     SET artist = $1, title = $2, format = $3, updated_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [artist, title, format, itemId, user.id]
  );

  if (result.rowCount === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(result.rows[0]);
}