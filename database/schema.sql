-- SQL Database Schema for Automotive Grade Fuel (AGF)
-- Supports both SQLite, MySQL, and PostgreSQL

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use AUTO_INCREMENT for MySQL, SERIAL for PostgreSQL
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role VARCHAR(20) DEFAULT 'User' CHECK(role IN ('User', 'Admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workers Table
CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use AUTO_INCREMENT for MySQL, SERIAL for PostgreSQL
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Available' CHECK(status IN ('Available', 'Busy', 'Offline')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity log for Recent Activity feed (worker deleted, etc.)
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    entity_type VARCHAR(20),
    entity_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service Types (petrol, diesel, crane, mechanic bike/car with amounts)
CREATE TABLE IF NOT EXISTS service_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO service_types (code, label, amount) VALUES
    ('petrol', 'Petrol', 100),
    ('diesel', 'Diesel', 150),
    ('crane', 'Crane', 200),
    ('mechanic_bike', 'Mechanic (Bike)', 300),
    ('mechanic_car', 'Mechanic (Car)', 300);

-- Service Requests Table (user portal)
CREATE TABLE IF NOT EXISTS service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    vehicle_number VARCHAR(50) NOT NULL,
    driving_licence VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK(status IN ('Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_service_types_code ON service_types(code);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at);
