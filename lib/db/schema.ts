// Database tables (Neon Postgres, through Drizzle). Change a table here, then run
// `pnpm db:generate` (writes a migration into drizzle/) and `pnpm db:migrate`.
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** One-time sign-in requests: a link token and a 6-digit code, both stored only as hashes. */
export const adminLoginRequests = pgTable(
  "admin_login_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull().unique(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (t) => [index("admin_login_requests_created_idx").on(t.createdAt)],
);

/** Signed-in browsers. The cookie holds a random token; only its hash is stored here. */
export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ip: text("ip"),
  location: text("location"),
  device: text("device"),
  createdAt: createdAt(),
});

/** Everything security-relevant that happens in the admin, newest first. */
export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    action: text("action").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (t) => [index("admin_audit_log_created_idx").on(t.createdAt)],
);

/** Site switches and values edited from the admin (key → JSON value). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Messages from the contact form, spam included (verdict "suspect"). */
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    verdict: text("verdict", { enum: ["ok", "suspect"] }).notNull(),
    score: integer("score").notNull(),
    reasons: jsonb("reasons").$type<string[]>().notNull().default([]),
    /** Owner's correction: "spam" or "ok"; null while not reviewed. */
    markedAs: text("marked_as", { enum: ["ok", "spam"] }),
    readAt: timestamp("read_at", { withTimezone: true }),
    archived: boolean("archived").notNull().default(false),
    location: text("location"),
    ip: text("ip"),
    device: text("device"),
    emailed: boolean("emailed").notNull().default(true),
  },
  (t) => [index("contact_messages_received_idx").on(t.receivedAt)],
);
