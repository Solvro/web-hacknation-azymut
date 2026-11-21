BEGIN;

CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  role text NOT NULL DEFAULT 'supervisor' CHECK (role IN ('supervisor', 'hr', 'admin'))
);
CREATE TABLE IF NOT EXISTS "session" (
  id text PRIMARY KEY,
  token text NOT NULL UNIQUE,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_id_idx ON "session"("userId");
CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("providerId", "accountId")
);
CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verification_identifier ON verification(identifier);

CREATE TABLE IF NOT EXISTS assessment (
  workspace uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('periodic', 'first')),
  title text NOT NULL,
  status text NOT NULL,
  due date,
  draft jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace, kind)
);
CREATE TABLE IF NOT EXISTS reminder (
  id uuid PRIMARY KEY,
  workspace uuid NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  FOREIGN KEY (workspace, kind) REFERENCES assessment(workspace, kind) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS reminder_unread ON reminder(workspace, kind) WHERE read_at IS NULL;
CREATE TABLE IF NOT EXISTS audit_event (
  id uuid PRIMARY KEY,
  workspace uuid NOT NULL,
  actor text NOT NULL REFERENCES "user"(id),
  action text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
