import { NextResponse } from "next/server";
const { getDB } = require("../../../../database/db");

export async function GET() {
  try {
    const db = getDB();
    const workers = await new Promise((resolve, reject) => {
      db.all(
        "SELECT id, email, first_name, last_name, phone_number, status, created_at FROM workers ORDER BY created_at DESC",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        }
      );
    });
    return NextResponse.json(workers);
  } catch (err) {
    console.error("Admin workers list error:", err);
    return NextResponse.json({ error: "Failed to load workers" }, { status: 500 });
  }
}
