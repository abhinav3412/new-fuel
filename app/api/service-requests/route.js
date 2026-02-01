import { NextResponse } from "next/server";
const { getDB, getLocalDateTimeString } = require("../../../database/db");

const SERVICE_AMOUNTS = {
  petrol: 100,
  diesel: 150,
  crane: 200,
  mechanic_bike: 300,
  mechanic_car: 300,
};

const VALID_SERVICE_TYPES = Object.keys(SERVICE_AMOUNTS);

function ensureServiceRequestsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS service_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        vehicle_number VARCHAR(50) NOT NULL,
        driving_licence VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      (err) => (err ? reject(err) : resolve())
    );
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      user_id,
      vehicle_number,
      driving_licence,
      phone_number,
      service_type,
    } = body || {};

    if (!vehicle_number || String(vehicle_number).trim() === "") {
      return NextResponse.json(
        { error: "Vehicle number is required" },
        { status: 400 }
      );
    }
    if (!driving_licence || String(driving_licence).trim() === "") {
      return NextResponse.json(
        { error: "Driving licence is required" },
        { status: 400 }
      );
    }
    if (!phone_number || String(phone_number).trim() === "") {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }
    if (!service_type || !VALID_SERVICE_TYPES.includes(service_type)) {
      return NextResponse.json(
        {
          error:
            "Service type is required and must be one of: petrol, diesel, crane, mechanic_bike, mechanic_car",
        },
        { status: 400 }
      );
    }

    const amount = SERVICE_AMOUNTS[service_type];
    const db = getDB();

    await ensureServiceRequestsTable(db);

    const createdAt = getLocalDateTimeString();
    const sql =
      "INSERT INTO service_requests (user_id, vehicle_number, driving_licence, phone_number, service_type, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)";
    const uid = user_id != null && user_id !== "" ? Number(user_id) : null;
    const params = [
      uid != null && !Number.isNaN(uid) ? uid : null,
      String(vehicle_number).trim(),
      String(driving_licence).trim(),
      String(phone_number).trim(),
      service_type,
      amount,
      createdAt,
    ];

    const result = await new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });

    return NextResponse.json(
      {
        success: true,
        id: result.id,
        amount,
        service_type,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Service request create error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const db = getDB();
    await ensureServiceRequestsTable(db);

    const url = request.url ? new URL(request.url) : null;
    const userIdParam = url?.searchParams?.get("user_id");
    const userId = userIdParam != null && userIdParam !== "" ? Number(userIdParam) : null;

    let sql = "SELECT * FROM service_requests";
    const params = [];
    if (userId != null && !Number.isNaN(userId)) {
      sql += " WHERE user_id = ?";
      params.push(userId);
    }
    sql += " ORDER BY created_at DESC";

    const rows = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, r) => (err ? reject(err) : resolve(r || [])));
    });

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Service requests list error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
