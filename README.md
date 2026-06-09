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
*   [**Prisma ORM**](https://www.prisma.io/): Definido en el proyecto para la conexión e interacción estructurada con la base de datos (PostgreSQL/MySQL).
*   [**Next-Auth v5 (Auth.js)**](https://authjs.dev/): Configurado en las dependencias para la gestión de sesiones y autenticación segura.

## 🛠️ Instalación y Uso Local

Para correr este proyecto en tu entorno de desarrollo local, sigue estos pasos:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/cofeeblcks/up_skill.git
   cd up_skill
   ```

2. **Instalar dependencias**
   Se recomienda usar `pnpm`:
   ```bash
   pnpm install
   ```

3. **Ejecutar el servidor de desarrollo**
   ```bash
   pnpm dev
   ```

4. **Acceder a la aplicación**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📂 Estructura del Proyecto

*   `/app`: Rutas principales de la aplicación bajo el paradigma App Router de Next.js (`/admin`, `/supervisor`, `/dashboard`).
*   `/components`: Componentes reutilizables de React.
    *   `/ui`: Componentes atómicos generados mediante Shadcn UI.
*   `/lib`: Utilidades globales y configuración de la base de datos.
*   `/styles`: Estilos globales y variables de Tailwind (`globals.css`).
*   `/prisma`: Esquemas de base de datos para Prisma.

---
*Desarrollado para proveer la mejor experiencia de aprendizaje corporativo.*
