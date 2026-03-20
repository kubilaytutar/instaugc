import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { createHash, randomBytes } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../data/instapuan.db");

mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Tabloları oluştur
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'subadmin',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    drive_file_id TEXT NOT NULL,
    source_url TEXT NOT NULL,
    storage_type TEXT NOT NULL DEFAULT 'GDRIVE',
    uploader_name TEXT,
    uploaded_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(user_id, video_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(user_id, video_id)
  );
`);

// Kullanıcıları oluştur (yoksa)
const { hashSync } = await import("bcryptjs");

const testUsers = [
  { email: "admin@instapuan.com", password: "Admin123!", name: "Admin", role: "admin" },
  { email: "juri1@instapuan.com", password: "Juri123!", name: "Jüri 1", role: "subadmin" },
  { email: "juri2@instapuan.com", password: "Juri123!", name: "Jüri 2", role: "subadmin" },
  { email: "creator1@instapuan.com", password: "Creator123!", name: "İçerik Üretici 1", role: "creator" },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password_hash, name, role, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

let created = 0;
for (const u of testUsers) {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(u.email);
  if (!existing) {
    const id = randomBytes(12).toString("hex");
    const now = Date.now();
    insertUser.run(id, u.email, hashSync(u.password, 10), u.name, u.role, now, now);
    created++;
    console.log(`✅ ${u.role.toUpperCase()} oluşturuldu: ${u.email} / ${u.password}`);
  }
}

if (created === 0) {
  console.log("✅ Tüm kullanıcılar zaten mevcut");
}

db.close();
console.log("✅ Veritabanı başlatıldı:", dbPath);
