import { NextResponse } from "next/server";
const { getDB } = require("../../../database/db");

function ensureFuelStationsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS fuel_stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => (err ? reject(err) : resolve())
    );
  });
}

export async function GET(request) {
  try {
    const db = getDB();
    await ensureFuelStationsTable(db);

    const stations = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM fuel_stations ORDER BY created_at DESC", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    return NextResponse.json(stations);
  } catch (err) {
    console.error("Fuel stations fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, latitude, longitude } = body || {};

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Station name is required" },
        { status: 400 }
      );
    }

    if (latitude === undefined || latitude === null) {
      return NextResponse.json(
        { error: "Latitude is required" },
        { status: 400 }
      );
    }

    if (longitude === undefined || longitude === null) {
      return NextResponse.json(
        { error: "Longitude is required" },
        { status: 400 }
      );
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json(
        { error: "Latitude and longitude must be valid numbers" },
        { status: 400 }
      );
    }

    const db = getDB();
    await ensureFuelStationsTable(db);

    const result = await new Promise((resolve, reject) => {
      const sql = "INSERT INTO fuel_stations (name, latitude, longitude) VALUES (?, ?, ?)";
      db.run(sql, [name.trim(), lat, lng], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });

    // Log the activity
    const ACTIVITY_LOG_TABLE = `
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type VARCHAR(50) NOT NULL,
        message VARCHAR(500) NOT NULL,
        entity_type VARCHAR(20),
        entity_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await new Promise((resolve, reject) => {
      db.run(ACTIVITY_LOG_TABLE, (err) => (err ? reject(err) : resolve()));
    });

    await new Promise((resolve, reject) => {
      const sql = "INSERT INTO activity_log (type, message, entity_type, entity_id) VALUES (?, ?, ?, ?)";
      db.run(sql, ["fuel_station_added", `Fuel station "${name.trim()}" was added`, "fuel_station", result.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return NextResponse.json(
      {
        success: true,
        id: result.id,
        name,
        latitude: lat,
        longitude: lng,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Fuel station create error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const url = request.url ? new URL(request.url) : null;
    const id = url?.searchParams?.get("id");

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid station ID" },
        { status: 400 }
      );
    }

    const db = getDB();
    await ensureFuelStationsTable(db);

    // Get station details before deletion for logging
    const station = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM fuel_stations WHERE id = ?", [Number(id)], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!station) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }

    // Delete the station
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM fuel_stations WHERE id = ?", [Number(id)], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Log the activity
    const ACTIVITY_LOG_TABLE = `
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type VARCHAR(50) NOT NULL,
        message VARCHAR(500) NOT NULL,
        entity_type VARCHAR(20),
        entity_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await new Promise((resolve, reject) => {
      db.run(ACTIVITY_LOG_TABLE, (err) => (err ? reject(err) : resolve()));
    });

    await new Promise((resolve, reject) => {
      const sql = "INSERT INTO activity_log (type, message, entity_type, entity_id) VALUES (?, ?, ?, ?)";
      db.run(sql, ["fuel_station_deleted", `Fuel station "${station.name}" was deleted`, "fuel_station", Number(id)], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Fuel station delete error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
