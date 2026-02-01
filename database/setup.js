// Database Setup Script
// Run this to initialize your database: node database/setup.js

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'agf_database.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Check if database already exists
if (fs.existsSync(dbPath)) {
  console.log('Database already exists. Delete agf_database.db to recreate.');
  process.exit(0);
}

// Read schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

// Create database and run schema in a single exec call so that
// all statements run in the correct order (tables before indexes).
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error creating database:', err.message);
    process.exit(1);
  }
  console.log('Database created successfully!');

  db.exec(schema, (execErr) => {
    if (execErr) {
      console.error('Error applying schema:', execErr.message);
      process.exit(1);
    }

    console.log('Schema applied successfully!');
    console.log('Database setup complete.');
    db.close();
  });
});
