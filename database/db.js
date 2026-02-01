// Database connection utility
// Choose one based on your database preference

// Option 1: SQLite (for development - no server needed)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function getSQLiteDB() {
  if (!db) {
    // Use the workspace root (Next.js/Turbopack root) so this works
    // both in dev and production. The DB file lives in /database/agf_database.db.
    const dbPath = path.join(process.cwd(), 'database', 'agf_database.db');

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database at', dbPath);
      }
    });
  }
  return db;
}

// Option 2: MySQL (uncomment if using MySQL)
/*
const mysql = require('mysql2/promise');

async function getMySQLDB() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agf_database'
  });
}
*/

// Option 3: PostgreSQL (uncomment if using PostgreSQL)
/*
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agf_database',
  port: process.env.DB_PORT || 5432
});

function getPostgreSQLDB() {
  return pool;
}
*/

/** Returns current server local time as "YYYY-MM-DD HH:MM:SS" for storing in DB so display matches when the action happened. */
function getLocalDateTimeString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

// Export based on your choice
module.exports = {
  getDB: getSQLiteDB, // Change to getMySQLDB or getPostgreSQLDB as needed
  getLocalDateTimeString,
  // For async MySQL/PostgreSQL:
  // getDB: getMySQLDB,
  // getDB: getPostgreSQLDB,
};
