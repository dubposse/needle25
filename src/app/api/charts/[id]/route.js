import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request, ctx) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const chartId = Number(id);

  if (!Number.isInteger(chartId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const result = await pool.query(
    "DELETE FROM charts WHERE id = $1 AND user_id = $2",
    [chartId, user.id]
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
  const chartId = Number(id);

  if (!Number.isInteger(chartId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
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
    `UPDATE charts
     SET artist = $1,
         title = $2,
         category = $3,
         comment = $4,
         updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [artist, title, category, comment, chartId, user.id]
  );

  if (result.rowCount === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(result.rows[0]);
}