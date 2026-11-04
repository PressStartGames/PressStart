-- Broadcasts: one row per mail sent to the list, and one row per recipient so a send can resume
-- after a crash or a daily cap without anyone getting the same mail twice.
CREATE TABLE IF NOT EXISTS broadcasts (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  body_md TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | sending | sent
  created_by TEXT NOT NULL,             -- WorkOS user id (no name or email stored)
  created_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  total INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS broadcast_recipients (
  broadcast_id TEXT NOT NULL REFERENCES broadcasts (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | claimed | sent | failed
  batch_key TEXT,                         -- the Resend Idempotency-Key of the batch that claimed it
  sent_at TEXT,
  error TEXT,
  PRIMARY KEY (broadcast_id, email)
);

CREATE INDEX IF NOT EXISTS broadcast_recipients_status ON broadcast_recipients (broadcast_id, status);
CREATE INDEX IF NOT EXISTS broadcast_recipients_sent_at ON broadcast_recipients (sent_at);
