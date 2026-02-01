import { NextResponse } from "next/server";
const { getDB } = require("../../../database/db");
const bcrypt = require("bcryptjs");

export async function POST(request) {
  try {
    const body = await request.json();
    const { role, email, password } = body || {};

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing email, password, or role" },
        { status: 400 }
      );
    }

    const db = getDB();
    const isWorker = role === "Worker";
    const isAdmin = role === "Admin";

    const table = isWorker ? "workers" : "users";

    const sql = isWorker
      ? "SELECT id, email, password, first_name, last_name, phone_number, status FROM workers WHERE email = ?"
      : "SELECT id, email, password, first_name, last_name, phone_number, role FROM users WHERE email = ?";

    const user = await new Promise((resolve, reject) => {
      db.get(sql, [email], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row || null);
      });
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email and role. Please sign up first." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }

    if (isAdmin && user.role !== "Admin") {
      return NextResponse.json(
        { error: "You are not an admin" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: user.id,
        role: isWorker ? "Worker" : user.role || "User",
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number || "",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

