-- The beta list (PLAN.md §6): no IP, no user agent. Applied by `wrangler d1 migrations apply`.
CREATE TABLE IF NOT EXISTS signups (
  email TEXT PRIMARY KEY,
  role TEXT,
  consent_text_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  confirm_sent_at TEXT,
  confirmed_at TEXT
);

CREATE INDEX IF NOT EXISTS signups_confirmed_at ON signups (confirmed_at);
