import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { hashSync } from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";
import * as schema from "../src/lib/db/schema";
import path from "path";
import fs from "fs";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "instapuan.db");
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
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
`);

const email = process.env.ADMIN_EMAIL || "admin@instapuan.com";
const password = process.env.ADMIN_PASSWORD || "admin123";

const now = new Date();

// Check if admin exists
const existing = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (existing) {
  console.log(`Admin user already exists: ${email}`);
} else {
  const id = createId();
  const passwordHash = hashSync(password, 10);

  sqlite.prepare(
    "INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, email, passwordHash, "Admin", "admin", now.getTime(), now.getTime());

  console.log(`Admin user created: ${email} / ${password}`);
}

sqlite.close();
console.log("Seed complete.");
