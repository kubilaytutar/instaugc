// Production seed - creates admin user if not exists
// Runs on every container start (safe - checks first)
// Retries if volume not yet mounted
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = process.env.DATABASE_PATH || "/data/instapuan.db";
const dataDir = path.dirname(dbPath);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function openDb(retries = 10, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      // Test write permission
      const testFile = path.join(dataDir, ".write-test");
      fs.writeFileSync(testFile, "ok");
      fs.unlinkSync(testFile);
      return new Database(dbPath);
    } catch (err) {
      console.log(`[seed] Attempt ${i + 1}/${retries} failed: ${err.message}`);
      if (i < retries - 1) {
        console.log(`[seed] Waiting ${delayMs}ms for volume mount...`);
        const start = Date.now();
        while (Date.now() - start < delayMs) { /* busy wait */ }
      }
    }
  }
  throw new Error(`Could not open database at ${dbPath} after ${retries} retries`);
}

const db = openDb();
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'subadmin',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    drive_file_id TEXT NOT NULL,
    source_url TEXT NOT NULL,
    storage_type TEXT NOT NULL DEFAULT 'GDRIVE',
    uploader_name TEXT,
    uploaded_by_id TEXT REFERENCES users(id),
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK(score >= 1 AND score <= 10),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(user_id, video_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(user_id, video_id)
  );
`);

const adminEmail = process.env.ADMIN_EMAIL || "admin@instapuan.com";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
if (!existing) {
  const bcrypt = require("bcryptjs");
  const { createId } = require("@paralleldrive/cuid2");
  const now = Date.now();
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(
    "INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(createId(), adminEmail, hash, "Admin", "admin", now, now);
  console.log(`[seed] Admin created: ${adminEmail}`);
} else {
  console.log(`[seed] Admin already exists: ${adminEmail}`);
}

db.close();
