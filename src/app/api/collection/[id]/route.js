import pool from "@/lib/db";

export async function DELETE(request, ctx) {
  const { id } = await ctx.params;
  const releaseId = Number(id);

  if (!Number.isInteger(releaseId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const result = await pool.query(
    "DELETE FROM collection WHERE id = $1",
    [releaseId]
  );

  if (result.rowCount === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}

export async function PATCH(request, ctx) {
  const { id } = await ctx.params;
  const releaseId = Number(id);

  if (!Number.isInteger(releaseId)) {
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
    `UPDATE collection
     SET artist = $1, title = $2, format = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [artist, title, format, releaseId]
  );

  if (result.rowCount === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(result.rows[0]);
}