-- Requiere migración previa `20250609000001_initial_schema.sql` (función public.set_updated_at).

-- Catálogo de roles (metadatos UI; los códigos alinean con public.app_role en usuarios)
CREATE TABLE public.settings_roles (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT settings_roles_code_format CHECK (code ~ '^[A-Z][A-Z0-9_]*$')
);

CREATE TABLE public.training_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color_variant TEXT NOT NULL DEFAULT 'primary',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT training_categories_color_check CHECK (
    color_variant IN (
      'primary',
      'secondary',
      'destructive',
      'success',
      'warning',
      'info'
    )
  )
);

CREATE TRIGGER settings_roles_set_updated_at
BEFORE UPDATE ON public.settings_roles
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER training_categories_set_updated_at
BEFORE UPDATE ON public.training_categories
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.settings_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_categories ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.settings_roles TO anon, authenticated, service_role;
GRANT ALL ON public.training_categories TO anon, authenticated, service_role;

INSERT INTO public.settings_roles (id, code, description, sort_order) VALUES
  ('sr-seed-1', 'EMPLOYEE', 'Acceso básico a capacitaciones asignadas', 1),
  ('sr-seed-2', 'SUPERVISOR', 'Gestión de equipo y reportes básicos', 2),
  ('sr-seed-3', 'ADMIN_HR', 'Acceso total al sistema y configuraciones', 3);

INSERT INTO public.training_categories (id, name, color_variant, sort_order) VALUES
  ('tc-seed-1', 'Seguridad', 'destructive', 1),
  ('tc-seed-2', 'Liderazgo', 'primary', 2),
  ('tc-seed-3', 'Cumplimiento', 'warning', 3),
  ('tc-seed-4', 'Técnico', 'success', 4),
  ('tc-seed-5', 'Habilidades Blandas', 'info', 5);
