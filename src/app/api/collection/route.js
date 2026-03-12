import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query("SELECT * FROM collection ORDER BY id DESC");
  return Response.json(result.rows);
}

export async function POST(request) {
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
    `INSERT INTO collection (artist, title, format)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [artist, title, format]
  );

  return Response.json(result.rows[0], { status: 201 });
}