import pool from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request) {
  const body = await request.json();

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters long" },
      { status: 400 }
    );
  }

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rowCount > 0) {
    return Response.json(
      { error: "User already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, created_at`,
    [email, passwordHash]
  );

  return Response.json(result.rows[0], { status: 201 });
}