import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { GENRES } from "@/lib/genres";

export async function POST(request) {
  const body = await request.json();

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const username = body.username?.trim().toLowerCase();
  const favoriteGenre1 = body.favoriteGenre1?.trim().toLowerCase();
  const favoriteGenre2 = body.favoriteGenre2?.trim().toLowerCase();

  if (!email || !password || !username || !favoriteGenre1 || !favoriteGenre2) {
    return Response.json(
      {
        error:
          "Email, username, password and two favorite genres are required",
      },
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

  if (!GENRES.includes(favoriteGenre1) || !GENRES.includes(favoriteGenre2)) {
    return Response.json({ error: "Invalid genre selection" }, { status: 400 });
  }

  if (favoriteGenre1 === favoriteGenre2) {
    return Response.json(
      { error: "Please choose two different genres" },
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
    `INSERT INTO users (
      email,
      username,
      password_hash,
      favorite_genre_1,
      favorite_genre_2
    )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, username, favorite_genre_1, favorite_genre_2, created_at`,
    [email, username, passwordHash, favoriteGenre1, favoriteGenre2]
  );

  return Response.json(result.rows[0], { status: 201 });
}