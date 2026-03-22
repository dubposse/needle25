import pool from "@/lib/db";
import { cookies } from "next/headers";

export async function DELETE() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const sessionResult = await pool.query(
    `SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()`,
    [sessionToken]
  );

  if (sessionResult.rowCount === 0) {
    return Response.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  const userId = sessionResult.rows[0].user_id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM collection WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM wishlist WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM charts WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Account deletion failed:", err);
    return Response.json({ error: "Could not delete account" }, { status: 500 });
  } finally {
    client.release();
  }

  cookieStore.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return Response.json({ message: "Account deleted" });
}
