-- Demo seed (ids stable for local/dev). Password for all: 123456 (bcrypt).
INSERT INTO public.users (id, name, email, password, role, department, points, supervisor_id, is_active)
VALUES
  (
    'seed-u1',
    'Ana García',
    'empleado@empresa.com',
    $pwd$2b$10$zT3uHz1H8c6ZpMfeTuVWdemNkjD5647tOsMbadwi5.bJ9DSnKFRv.$pwd$,
    'EMPLOYEE',
    'Ventas',
    2450,
    'seed-u2',
    TRUE
  ),
  (
    'seed-u2',
    'Carlos Mendoza',
    'supervisor@empresa.com',
    $pwd$2b$10$zT3uHz1H8c6ZpMfeTuVWdemNkjD5647tOsMbadwi5.bJ9DSnKFRv.$pwd$,
    'SUPERVISOR',
    'TI',
    3120,
    NULL,
    TRUE
  ),
  (
    'seed-u3',
    'Laura Sánchez',
    'laura.sanchez@empresa.com',
    $pwd$2b$10$zT3uHz1H8c6ZpMfeTuVWdemNkjD5647tOsMbadwi5.bJ9DSnKFRv.$pwd$,
    'EMPLOYEE',
    'RRHH',
    1890,
    'seed-u2',
    TRUE
  ),
  (
    'seed-u4',
    'Miguel Torres',
    'miguel.torres@empresa.com',
    $pwd$2b$10$zT3uHz1H8c6ZpMfeTuVWdemNkjD5647tOsMbadwi5.bJ9DSnKFRv.$pwd$,
    'EMPLOYEE',
    'Finanzas',
    2780,
    'seed-u2',
    TRUE
  ),
  (
    'seed-u5',
    'Roberto Díaz',
    'roberto.diaz@empresa.com',
    $pwd$2b$10$zT3uHz1H8c6ZpMfeTuVWdemNkjD5647tOsMbadwi5.bJ9DSnKFRv.$pwd$,
    'EMPLOYEE',
    'Operaciones',
    1560,
    'seed-u2',
    FALSE
  ),
  (
    'seed-u6',
    'María González',
    'admin@empresa.com',
    $pwd$2b$10$zT3uHz1H8c6ZpMfeTuVWdemNkjD5647tOsMbadwi5.bJ9DSnKFRv.$pwd$,
    'ADMIN_HR',
    'RRHH',
    4200,
    NULL,
    TRUE
  );

INSERT INTO public.trainings (id, title, description, category, duration_min, file_url, required_roles, positions, is_active)
VALUES
  (
    'seed-t1',
    'Seguridad en el Trabajo',
    'Normas y procedimientos de seguridad.',
    'Seguridad',
    45,
    NULL,
    ARRAY['EMPLOYEE', 'SUPERVISOR']::public.app_role[],
    ARRAY['Técnico', 'Coordinador']::TEXT[],
    TRUE
  ),
  (
    'seed-t2',
    'Liderazgo Efectivo',
    NULL,
    'Liderazgo',
    60,
    NULL,
    ARRAY['SUPERVISOR', 'ADMIN_HR']::public.app_role[],
    ARRAY['Gerente', 'Director']::TEXT[],
    TRUE
  ),
  (
    'seed-t3',
    'Cumplimiento Normativo',
    NULL,
    'Cumplimiento',
    30,
    NULL,
    ARRAY['EMPLOYEE', 'SUPERVISOR', 'ADMIN_HR']::public.app_role[],
    ARRAY[]::TEXT[],
    TRUE
  ),
  (
    'seed-t4',
    'Herramientas Digitales',
    NULL,
    'Técnico',
    40,
    NULL,
    ARRAY['EMPLOYEE']::public.app_role[],
    ARRAY['Analista', 'Técnico']::TEXT[],
    TRUE
  ),
  (
    'seed-t5',
    'Comunicación Efectiva',
    NULL,
    'Habilidades Blandas',
    35,
    NULL,
    ARRAY['EMPLOYEE', 'SUPERVISOR']::public.app_role[],
    ARRAY[]::TEXT[],
    FALSE
  );

INSERT INTO public.assignments (id, user_id, training_id, status, progress, score)
VALUES
  ('seed-a1', 'seed-u1', 'seed-t1', 'COMPLETED', 100, 90),
  ('seed-a2', 'seed-u1', 'seed-t2', 'IN_PROGRESS', 45, NULL),
  ('seed-a3', 'seed-u3', 'seed-t1', 'COMPLETED', 100, 85),
  ('seed-a4', 'seed-u4', 'seed-t1', 'NOT_STARTED', 0, NULL),
  ('seed-a5', 'seed-u1', 'seed-t3', 'COMPLETED', 100, 100),
  ('seed-a6', 'seed-u2', 'seed-t3', 'IN_PROGRESS', 60, NULL),
  ('seed-a7', 'seed-u6', 'seed-t2', 'COMPLETED', 100, 95);
