import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  // admin: tam yetkili | subadmin: izler/oylar/ekler | creator: sadece kendi videolarını ekler
  role: text("role", { enum: ["admin", "subadmin", "creator"] }).notNull().default("subadmin"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  driveFileId: text("drive_file_id").notNull(),
  sourceUrl: text("source_url").notNull(),
  storageType: text("storage_type", { enum: ["GDRIVE", "DIRECT_URL", "S3"] })
    .notNull()
    .default("GDRIVE"),
  uploaderName: text("uploader_name"),
  uploadedById: text("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
  description: text("description"),
  adminFeedback: text("admin_feedback"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const ratings = sqliteTable("ratings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
