import pool from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  const { ok, retryAfter } = await rateLimit(request, { limit: 10, window: 15 * 60 * 1000 });
  if (!ok) {
    return Response.json(
      { error: `Too many login attempts. Please try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      "SELECT id, email, username, favorite_genre_1, favorite_genre_2, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await pool.query(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    const cookieStore = await cookies();

    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return Response.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        favoriteGenre1: user.favorite_genre_1,
        favoriteGenre2: user.favorite_genre_2,
      },
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}