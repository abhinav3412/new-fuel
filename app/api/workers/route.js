import { NextResponse } from "next/server";
const { getDB } = require("../../../database/db");

/** Returns active workers (Available or Busy) for the user dashboard. */
export async function GET() {
  try {
    const db = getDB();
    const workers = await new Promise((resolve, reject) => {
      db.all(
        "SELECT id, first_name, last_name, status FROM workers WHERE status IN ('Available', 'Busy') ORDER BY first_name, last_name",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        }
      );
    });
    return NextResponse.json(workers);
  } catch (err) {
    console.error("Workers list error:", err);
    return NextResponse.json({ error: "Failed to load workers" }, { status: 500 });
  }
}
