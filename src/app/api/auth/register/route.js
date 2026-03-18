import pool from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request) {
  const body = await request.json();

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const username = body.username?.trim().toLowerCase();

  if (!email || !password || !username) {
    return Response.json(
      { error: "Email, username and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters long" },
      { status: 400 }
    );
  }

  const usernameRegex = /^[a-z0-9_-]+$/;

  if (!usernameRegex.test(username)) {
    return Response.json(
      {
        error:
          "Username may only contain lowercase letters, numbers, hyphens and underscores",
      },
      { status: 400 }
    );
  }

  const existingUserByEmail = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUserByEmail.rowCount > 0) {
    return Response.json({ error: "User already exists" }, { status: 409 });
  }

  const existingUserByUsername = await pool.query(
    "SELECT id FROM users WHERE username = $1",
    [username]
  );

  if (existingUserByUsername.rowCount > 0) {
    return Response.json({ error: "Username already taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, username, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, username, created_at`,
    [email, username, passwordHash]
  );

  return Response.json(result.rows[0], { status: 201 });
}