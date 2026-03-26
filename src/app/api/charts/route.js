import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ALLOWED_CATEGORIES, CATEGORY_LIMITS } from "@/lib/charts";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM charts WHERE user_id = $1 ORDER BY category ASC, id DESC",
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
  const category = body.category?.trim();
  const comment = body.comment?.trim() || "";

  const allowedCategories = ALLOWED_CATEGORIES;

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

  // category limits
  const categoryLimits = CATEGORY_LIMITS;

  try {
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

    const result = await pool.query(
      `INSERT INTO charts (artist, title, category, comment, is_public, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [artist, title, category, comment, true, user.id]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}