-- Enums aligned with prisma/schema.prisma
CREATE TYPE public.app_role AS ENUM ('EMPLOYEE', 'SUPERVISOR', 'ADMIN_HR');

CREATE TYPE public.training_status AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED'
);

CREATE TYPE public.badge_type AS ENUM (
  'FIRST_TRAINING',
  'STREAK_5',
  'STREAK_10',
  'TOP_SCORER',
  'PERFECT_SCORE',
  'EARLY_BIRD',
  'TEAM_PLAYER'
);

-- Users
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'EMPLOYEE',
  position TEXT,
  department TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  supervisor_id TEXT REFERENCES public.users (id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX users_supervisor_id_idx ON public.users (supervisor_id);
CREATE INDEX users_email_idx ON public.users (email);

-- Trainings
CREATE TABLE public.trainings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  file_url TEXT,
  required_roles public.app_role[] NOT NULL DEFAULT ARRAY[]::public.app_role[],
  positions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assignments
CREATE TABLE public.assignments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  training_id TEXT NOT NULL REFERENCES public.trainings (id) ON DELETE CASCADE,
  status public.training_status NOT NULL DEFAULT 'NOT_STARTED',
  progress INTEGER NOT NULL DEFAULT 0,
  score INTEGER,
  due_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, training_id)
);

CREATE INDEX assignments_user_id_idx ON public.assignments (user_id);
CREATE INDEX assignments_training_id_idx ON public.assignments (training_id);

-- Badges
CREATE TABLE public.badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  type public.badge_type NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, type)
);

CREATE INDEX badges_user_id_idx ON public.badges (user_id);

-- Audit logs
CREATE TABLE public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs (user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER trainings_set_updated_at
BEFORE UPDATE ON public.trainings
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER assignments_set_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS: enabled; no policies for anon/authenticated → deny direct access.
-- Next.js API uses the service role key, which bypasses RLS.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Optional future: policies using auth.uid() and a profiles table.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
