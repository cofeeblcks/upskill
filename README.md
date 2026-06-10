# UpSkill - Plataforma de Gestión de Capacitaciones

UpSkill es una plataforma web moderna diseñada para gestionar y dar seguimiento a las capacitaciones de los empleados de una organización. Proporciona una experiencia interactiva y gamificada adaptada a diferentes roles: Empleados, Supervisores y Administradores de Recursos Humanos.

## 🚀 Características Principales

*   **Dashboards Basados en Roles**:
    *   **Empleados**: Visualización de capacitaciones asignadas, seguimiento de progreso y sistema de logros (gamificación).
    *   **Supervisores**: Monitoreo del equipo a cargo, estadísticas de cumplimiento y empleados con alertas de rezago.
    *   **Administradores (HR)**: Gestión completa del catálogo de capacitaciones, administración de usuarios y métricas globales de la plataforma.
*   **Gestión de Capacitaciones**: Creación, edición, activación/desactivación y eliminación de cursos con control de asignaciones mediante diálogos interactivos.
*   **Experiencia de Usuario (UX) Premium**: 
    *   Diseño oscuro moderno y limpio.
    *   Skeletons de carga fluida en navegaciones asíncronas.
    *   Loader global estilizado para transiciones entre páginas.
    *   Notificaciones tipo Toast en tiempo real.
*   **Filtros Interactivos**: Búsqueda en tiempo real por nombre, departamento, roles, categorías y estados en todas las tablas del sistema.

## 💻 Stack Tecnológico

El proyecto está construido utilizando las últimas tecnologías del ecosistema web moderno:

### Core
*   [**Next.js 16.2**](https://nextjs.org/): Framework de React con App Router para renderizado del lado del servidor (SSR) y optimización de rutas.
*   [**React 19**](https://react.dev/): Biblioteca principal para la interfaz de usuario.
*   [**TypeScript**](https://www.typescriptlang.org/): Tipado estricto para mayor seguridad y robustez del código.

### Estilos y UI
*   [**Tailwind CSS v4**](https://tailwindcss.com/): Framework de utilidades CSS para diseño responsivo y customización rápida.
*   [**Radix UI**](https://www.radix-ui.com/): Componentes base accesibles y sin estilos.
*   [**Shadcn UI**](https://ui.shadcn.com/): Colección de componentes UI diseñados sobre Radix UI y Tailwind (Botones, Tablas, Modales, Dropdowns, etc.).
*   [**Lucide React**](https://lucide.dev/): Biblioteca de iconos limpia y consistente.

### Funcionalidad y Herramientas Adicionales
*   [**Sonner**](https://sonner.emilkowal.ski/): Sistema de notificaciones (Toasts) altamente personalizable.
*   [**Recharts**](https://recharts.org/): Biblioteca de gráficos interactivos utilizada en el panel de analíticas.
*   [**React Hook Form**](https://react-hook-form.com/) + [**Zod**](https://zod.dev/): Gestión de estados de formularios y validación de esquemas (usado en la creación/edición de capacitaciones).
*   [**Supabase**](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`): PostgreSQL alojado, cliente tipado y sesión SSR en Next.js. Las rutas `app/api/*` usan la **service role** (solo servidor) mientras RLS no expone políticas a `anon`; [`proxy.ts`](proxy.ts) refresca la sesión de Supabase Auth cuando la configures (Next.js 16).
*   [**Next-Auth v5 (Auth.js)**](https://authjs.dev/): Presente en dependencias para evolución futura de sesiones; el login actual valida usuarios en la tabla `public.users` vía Supabase + `bcryptjs`.

## 🛠️ Instalación y Uso Local

Para correr este proyecto en tu entorno de desarrollo local, sigue estos pasos:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/cofeeblcks/up_skill.git
   cd up_skill
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Variables de entorno**
   Copia [`.env.example`](.env.example) a `.env.local` y rellena:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clave **anon** JWT del panel; si aparece *Invalid API key* en red, revisa que no sea la `service_role`).
   - `SUPABASE_SERVICE_ROLE_KEY` (solo servidor; **no** la expongas al cliente).

4. **Migraciones con Supabase CLI** (recomendado)

   La CLI va como dependencia de desarrollo. Tras `npm install`, en la raíz del repo:

   ```bash
   npx supabase login
   ```

   Enlaza el repo con tu proyecto en la nube (**Project Settings → General → Reference ID**):

   ```bash
   npm run db:link
   # o: npx supabase link --project-ref TU_PROJECT_REF
   ```

   Aplica las migraciones de [`supabase/migrations/`](supabase/migrations/) al Postgres remoto:

   ```bash
   npm run db:push
   ```

   Comprueba el historial con `npm run db:migration:list`.

   **Alternativa:** si no usas la CLI, puedes pegar y ejecutar en el **SQL Editor** del dashboard los mismos archivos SQL, en orden (ver nombres en `supabase/migrations/`).

   Sin migraciones aplicadas, las APIs pueden fallar o devolver datos vacíos.

   La migración `20250609120000_settings_roles_and_categories.sql` crea `settings_roles` y `training_categories` (catálogo usado en **Admin → Configuración**) con datos iniciales de ejemplo.

5. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Acceder a la aplicación**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📂 Estructura del Proyecto

*   `/app`: Rutas principales de la aplicación bajo el paradigma App Router de Next.js (`/admin`, `/supervisor`, `/dashboard`).
*   `/components`: Componentes reutilizables de React.
    *   `/ui`: Componentes atómicos generados mediante Shadcn UI.
*   `/lib`: Utilidades globales; [`lib/supabase/`](lib/supabase/) clientes browser, servidor y service-role; la actualización de cookies de sesión de Supabase Auth está integrada en [`proxy.ts`](proxy.ts) (Next.js 16 usa `proxy` en lugar de `middleware.ts`).
*   `/types`: Tipos generados o mantenidos a mano para el cliente Supabase ([`types/database.types.ts`](types/database.types.ts)).
*   `/supabase`: [`config.toml`](supabase/config.toml) (CLI) y [`migrations/`](supabase/migrations/) (esquema + seed).
*   `/styles`: Estilos globales y variables de Tailwind (`globals.css`).

**Tipos desde el proyecto Supabase:** cuando tengas el CLI vinculado, puedes regenerar tipos con `supabase gen types typescript --linked > types/database.types.ts` (o `--project-id`) y sustituir el archivo manual si lo prefieres.

---
*Desarrollado para proveer la mejor experiencia de aprendizaje corporativo.*
