import { NextResponse } from "next/server";
const { getDB } = require("../../../../database/db");

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

export async function GET(request) {
  try {
    const db = getDB();
    const url = request.url ? new URL(request.url) : null;
    const dateParam = url?.searchParams?.get("date") ?? null; // YYYY-MM-DD for activity filter
    const filterByDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam);

    await new Promise((resolve, reject) => {
      db.run(ACTIVITY_LOG_TABLE, (err) => (err ? reject(err) : resolve()));
    });

    const totalUsers = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'User'", [], (err, row) => {
        if (err) reject(err);
        else resolve(row?.count ?? 0);
      });
    });
    const totalWorkers = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM workers", [], (err, row) => {
        if (err) reject(err);
        else resolve(row?.count ?? 0);
      });
    });
    const activeWorkers = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM workers WHERE status IN ('Available', 'Busy')", [], (err, row) => {
        if (err) reject(err);
        else resolve(row?.count ?? 0);
      });
    });

    const recentUsers = await new Promise((resolve, reject) => {
      if (filterByDate) {
        db.all(
          "SELECT id, email, first_name, last_name, created_at FROM users WHERE role = 'User' AND DATE(created_at) = ? ORDER BY created_at DESC LIMIT 50",
          [dateParam],
          (err, rows) => (err ? reject(err) : resolve(rows ?? []))
        );
      } else {
        db.all("SELECT id, email, first_name, last_name, created_at FROM users WHERE role = 'User' ORDER BY created_at DESC LIMIT 10", [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        });
      }
    });
    const recentWorkersWithDate = await new Promise((resolve, reject) => {
      if (filterByDate) {
        db.all(
          "SELECT id, first_name, last_name, status, created_at FROM workers WHERE DATE(created_at) = ? ORDER BY created_at DESC LIMIT 50",
          [dateParam],
          (err, rows) => (err ? reject(err) : resolve(rows ?? []))
        );
      } else {
        db.all("SELECT id, first_name, last_name, status, created_at FROM workers ORDER BY created_at DESC LIMIT 10", [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        });
      }
    });
    const recentWorkersForPanel = await new Promise((resolve, reject) => {
      db.all("SELECT id, first_name, last_name, status FROM workers ORDER BY id DESC LIMIT 5", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows ?? []);
      });
    });
    const serviceRequests = await new Promise((resolve, reject) => {
      db.all(
        `SELECT sr.id, sr.user_id, sr.vehicle_number, sr.service_type, sr.status, sr.created_at, u.first_name, u.last_name 
         FROM service_requests sr 
         LEFT JOIN users u ON sr.user_id = u.id 
         ORDER BY sr.created_at DESC LIMIT 20`,
        [],
        (err, rows) => (err ? reject(err) : resolve(rows ?? []))
      );
    });
    const activeRequestsCount = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM service_requests WHERE status IN ('Pending', 'Assigned', 'In Progress')",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count ?? 0);
        }
      );
    });
    const activityLog = await new Promise((resolve, reject) => {
      if (filterByDate) {
        db.all(
          "SELECT id, type, message, created_at FROM activity_log WHERE DATE(created_at) = ? ORDER BY created_at DESC LIMIT 50",
          [dateParam],
          (err, rows) => (err ? reject(err) : resolve(rows ?? []))
        );
      } else {
        db.all("SELECT id, type, message, created_at FROM activity_log ORDER BY created_at DESC LIMIT 15", [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        });
      }
    });

    const userActivities = (recentUsers || []).map((u) => ({
      type: "user_registered",
      message: `${u.first_name} ${u.last_name} joined the platform`,
      created_at: u.created_at,
      first_name: u.first_name,
      last_name: u.last_name,
    }));
    const workerCreatedActivities = (recentWorkersWithDate || []).map((w) => ({
      type: "worker_created",
      message: `Worker ${w.first_name} ${w.last_name} joined`,
      created_at: w.created_at,
      first_name: w.first_name,
      last_name: w.last_name,
    }));
    const logActivities = (activityLog || []).map((a) => ({
      type: a.type,
      message: a.message,
      created_at: a.created_at,
    }));
    const recentActivity = [...userActivities, ...workerCreatedActivities, ...logActivities]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);

    return NextResponse.json({
      totalUsers,
      totalWorkers,
      activeWorkers,
      activeRequests: activeRequestsCount,
      recentUsers,
      recentActivity,
      activeWorkersList: recentWorkersForPanel,
      serviceRequests,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
