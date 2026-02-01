import { NextResponse } from "next/server";
const { getDB } = require("../../../../database/db");

export async function GET() {
  try {
    const db = getDB();
    const users = await new Promise((resolve, reject) => {
      db.all(
        "SELECT id, email, first_name, last_name, phone_number, role, created_at FROM users ORDER BY created_at DESC",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        }
      );
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error("Admin users list error:", err);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
