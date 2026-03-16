import pool from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
    await pool.query("DELETE FROM sessions WHERE token = $1", [sessionToken]);
  }

  cookieStore.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return Response.json({ message: "Logged out" });
}