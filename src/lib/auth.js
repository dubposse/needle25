import pool from "@/lib/db";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const result = await pool.query(
    `SELECT users.id, users.email
     FROM sessions
     JOIN users ON sessions.user_id = users.id
     WHERE sessions.token = $1
       AND sessions.expires_at > NOW()`,
    [sessionToken]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}