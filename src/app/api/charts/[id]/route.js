import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ALLOWED_CATEGORIES, CATEGORY_LIMITS } from "@/lib/charts";

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

  try {
    const result = await pool.query(
      "DELETE FROM charts WHERE id = $1 AND user_id = $2",
      [chartId, user.id]
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
  const chartId = Number(id);

  if (!Number.isInteger(chartId)) {
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
  const category = body.category?.trim();
  const comment = body.comment?.trim() || "";

  const allowedCategories = ALLOWED_CATEGORIES;
  const categoryLimits = CATEGORY_LIMITS;

  if (!artist || !title || !category) {
    return Response.json(
      { error: "Artist, title and category are required" },
      { status: 400 }
    );
  }

  if (!allowedCategories.includes(category)) {
    return Response.json({ error: "Invalid category" }, { status: 400 });
  }

  if (/https?:\/\/|ftp:\/\/|www\./i.test(comment)) {
    return Response.json(
      { error: "Links are not allowed in the comment" },
      { status: 400 }
    );
  }

  try {
    const existingResult = await pool.query(
      "SELECT id, category FROM charts WHERE id = $1 AND user_id = $2",
      [chartId, user.id]
    );

    if (existingResult.rowCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const existingChart = existingResult.rows[0];

    if (existingChart.category !== category) {
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM charts
         WHERE user_id = $1 AND category = $2`,
        [user.id, category]
      );

      const currentCount = Number(countResult.rows[0].count);
      const limit = categoryLimits[category];

      if (currentCount >= limit) {
        return Response.json(
          {
            error: `Limit reached: max ${limit} entries allowed for this category`,
          },
          { status: 400 }
        );
      }
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

    return Response.json(result.rows[0]);
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}