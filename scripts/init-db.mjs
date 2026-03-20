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

// Admin kullanıcısı yoksa oluştur
const existing = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
if (!existing) {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  // bcryptjs olmadan basit hash (production'da env ile override edilmeli)
  // Basit bir bcrypt mock yerine doğrudan bcryptjs kullanıyoruz
  const { hashSync } = await import("bcryptjs");
  const passwordHash = hashSync(adminPassword, 10);

  const id = randomBytes(12).toString("hex");
  const now = Date.now();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'admin', ?, ?)
  `).run(id, "admin@instapuan.com", passwordHash, "Admin", now, now);

  console.log("✅ Admin kullanıcısı oluşturuldu:");
  console.log("   Email: admin@instapuan.com");
  console.log("   Şifre:", adminPassword);
} else {
  console.log("✅ Veritabanı hazır (admin zaten mevcut)");
}

db.close();
console.log("✅ Veritabanı başlatıldı:", dbPath);
