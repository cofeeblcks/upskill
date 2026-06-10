# UpSkill — Registro de Cambios y Mejoras

**Proyecto:** UpSkill — Plataforma de Gestión de Capacitaciones  
**Tecnología:** Next.js 16.2 · React 19 · TypeScript · Tailwind CSS v4  
**Fecha de actualización:** Junio 2026

---

## 1. Rediseño Visual (UI/UX)

### 1.1 Nuevo Tema de Color — Estilo Nebula Admin

Se reemplazó el tema oscuro por defecto por un tema claro moderno inspirado en el diseño **Nebula Admin**, utilizando los colores del logo UpSkill.

| Token | Antes | Después |
|-------|-------|---------|
| Fondo | `#0D1B2A` (azul muy oscuro) | Degradado azul → teal → verde claro |
| Cards | `#1A2E45` (azul oscuro) | `#FFFFFF` blanco con sombra suave |
| Primario | `#1E6FD9` | `#1E6FD9` (se mantiene) |
| Acento | `#3B8FFF` | `#0FAAA8` (teal del logo) |
| Texto | Blanco | `#0F172A` azul oscuro |
| Borde | `#1E3A5F` | `#E2E8F0` gris claro |

> El **modo oscuro** se conserva y funciona correctamente con el toggle. Al activarlo regresa al diseño oscuro original.

---

### 1.2 Logo Real de la Empresa

- Se reemplazó el logo placeholder (letra "U" con punto verde) por la imagen oficial `logo.jpeg`.
- El logo ahora es **circular** con recorte preciso usando `overflow-hidden` + `rounded-full`.
- Se agregó **animación**: al pasar el cursor el logo crece (`scale-110`) y rota ligeramente (`rotate-6`) con transición suave de 300ms.
- El logo aparece en: Sidebar, Topbar (móvil) y pantalla de Login.

---

### 1.3 Cards Completamente Redondeadas

Todos los componentes de tipo tarjeta ahora usan `rounded-2xl` (16px de radio).

- **Sin borde visible** — se eliminó el borde de 1px y se reemplazó por sombra con tinte azul del logo.
- **Sombra en reposo:** `0 2px 20px rgba(30,111,217,0.07)`
- **Sombra en hover:** `0 6px 28px rgba(30,111,217,0.12)` + sube 2px (`-translate-y-0.5`)
- Componentes actualizados: `Card`, `StatCard`, `TrainingCard`, `BadgeGrid`, `Leaderboard`, `ProgressDonut`.

---

### 1.4 Topbar Flotante Redondeado

El encabezado superior pasó de ser una barra pegada al borde a un **elemento flotante** con bordes redondeados:

- `rounded-2xl` en todos los lados
- Margen lateral `mx-4` y margen superior `mt-3`
- Fondo: `bg-card/90` con efecto `backdrop-blur-md`
- Sombra azulada suave
- Compatible con modo claro y oscuro (`bg-card` cambia automáticamente con el tema)

---

### 1.5 Sidebar Flotante Redondeado

El panel de navegación lateral pasó de ocupar todo el borde izquierdo a ser un **panel flotante**:

- `rounded-2xl` en todos los lados
- Margen: `my-3 ml-3` (separación del borde de la pantalla)
- Sombra lateral: `2px 0 24px rgba(30,111,217,0.08)`
- Items de navegación activos: fondo `bg-primary/10`, texto `text-primary`, esquinas `rounded-2xl`
- Items inactivos: hover con `bg-muted`

---

### 1.6 Fondo Degradado con Colores del Logo

El fondo de toda la aplicación usa un degradado suave que combina los tres colores del logo UpSkill:

```
Azul claro (#dbeafe) → Teal (#ccfbf1) → Verde claro (#d1fae5) → Azul cielo (#e0f2fe)
```

---

### 1.7 Nuevo Diseño de Tarjetas de Estadísticas (StatCard)

Se rediseñó el componente `StatCard` para seguir el estilo Nebula Admin:

| Elemento | Antes | Después |
|----------|-------|---------|
| Acento de color | Borde superior de 4px coloreado | Icono en chip `rounded-2xl` con fondo de color |
| Badge de tendencia | Texto al pie | Chip pill en esquina superior derecha (`+12%`) |
| Jerarquía | Título arriba, valor abajo | Icono arriba, valor grande, título pequeño debajo |

---

### 1.8 Compatibilidad Dark/Light en Todos los Componentes

Se corrigieron componentes que tenían colores hardcodeados que no funcionaban en modo oscuro:

| Componente | Problema | Solución |
|------------|----------|----------|
| Topbar | `bg-white/90` fijo | → `bg-card/90` (token del tema) |
| Training card footer | `bg-slate-50/60` fijo | → `bg-muted/40` |
| Training card status | `text-amber-700` fijo | → `text-warning` (token) |
| Training card categorías | `bg-*-100 text-*-700` | → `bg-*/15` + `dark:text-*-400` |
| Leaderboard filas | `bg-slate-50` fijo | → `bg-muted/50` |
| Insignias (badges) | `bg-*-100 text-*-600` | → `bg-*/20 text-*-500` |

---

## 2. Seguridad y Autenticación

### 2.1 Protección de Rutas por Rol (`proxy.ts`)

Se creó el archivo `proxy.ts` (middleware de Next.js 16) que protege todas las rutas privadas:

- **Sin sesión activa** → redirige automáticamente al login (`/`)
- **Rol incorrecto** → redirige al dashboard que corresponde al rol
- **Ya autenticado intentando ver el login** → redirige a su dashboard

| Ruta | Requiere rol |
|------|-------------|
| `/dashboard/*` | `EMPLOYEE` |
| `/supervisor/*` | `SUPERVISOR` |
| `/admin/*` | `ADMIN_HR` |

---

### 2.2 Sistema de Login Real con Cookies

Se reemplazó la simulación de login (`setTimeout`) por un sistema real:

- **API endpoint:** `POST /api/auth/login`
- **Validación** contra usuarios registrados (preparado para conectar a base de datos)
- **Cookie `upskill-session`:** HttpOnly, Secure en producción, 7 días de duración
- **Redirección automática** al dashboard correcto según el rol del usuario
- **Mensaje de error** visible en pantalla si las credenciales son incorrectas

**Credenciales de acceso actuales:**

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin HR | `admin@empresa.com` | `123456` |
| Supervisor | `supervisor@empresa.com` | `123456` |
| Empleado | `empleado@empresa.com` | `123456` |

---

### 2.3 Logout Real

- **API endpoint:** `POST /api/auth/logout`
- Al cerrar sesión se borra la cookie `upskill-session` del servidor
- El botón "Cerrar Sesión" del sidebar llama a este endpoint antes de redirigir

---

## 3. API Routes (Backend)

Se creó la estructura base de las rutas de API. Actualmente usan datos mock pero tienen comentarios `// TODO` para conectar con Prisma/PostgreSQL cuando se configure la base de datos.

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `POST /api/auth/login` | POST | Autenticación y emisión de cookie de sesión |
| `POST /api/auth/logout` | POST | Eliminación de cookie de sesión |
| `GET /api/trainings` | GET | Lista todas las capacitaciones |
| `POST /api/trainings` | POST | Crea una nueva capacitación |
| `GET /api/employees` | GET | Lista todos los empleados |

---

## 4. Rendimiento

### 4.1 Lazy Loading de Gráficos

Los 4 gráficos de la página de **Analíticas** se extrajeron a un componente separado (`components/analytics-charts.tsx`) y se cargan con `dynamic()` de Next.js:

- La biblioteca Recharts (pesada) **no se incluye en el bundle inicial**
- Mientras los gráficos cargan se muestran **skeletons animados**
- Ahorro estimado: ~150kb en el bundle de la primera carga

### 4.2 Optimización de Imágenes

- Se habilitó la optimización automática de Next.js (`formats: ['image/avif', 'image/webp']`)
- Se eliminó la opción `unoptimized: true` que impedía la compresión
- El logo y la imagen de fondo del login se sirven en formato moderno

---

## 5. Nuevas Páginas

### 5.1 Mis Capacitaciones (`/dashboard/trainings`)

Nueva página completa para el empleado con todas sus capacitaciones asignadas.

**Funcionalidades:**
- Barra de búsqueda en tiempo real (por título y categoría)
- Filtros por estado: Todos · Pendiente · En Curso · Completado
- Contador dinámico de resultados por filtro
- Botón para limpiar búsqueda
- Estado vacío con mensaje cuando no hay resultados
- Grid responsivo de tarjetas de capacitación

---

### 5.2 Mis Logros (`/dashboard/achievements`)

Nueva página de gamificación con todas las insignias del empleado.

**Funcionalidades:**
- Estadísticas en la parte superior: insignias obtenidas, puntos totales, barra de progreso general
- Sección **"Insignias Desbloqueadas"**: muestra fecha de obtención y puntos ganados
- Sección **"Por Desbloquear"**: insignias bloqueadas con icono de candado y puntos disponibles
- 7 tipos de insignias: Primera Capacitación, Racha de 5, Racha de 10, Mejor Puntuación, Puntuación Perfecta, Madrugador, Jugador de Equipo

---

### 5.3 Perfil de Empleado (`/dashboard/profile`) — Completado

Se completó la sección de "Resumen de Actividad" que antes mostraba solo un placeholder.

**Agregado:**
- 4 tarjetas de estadísticas rápidas: Completadas, Puntos, Racha, Ranking
- Barra de progreso general con porcentaje
- Historial completo de capacitaciones con estado, puntos ganados por cada una y fecha

---

### 5.4 Reportes del Equipo (`/supervisor/reports`)

Nueva página para el supervisor con análisis completo de su equipo.

**Funcionalidades:**
- 4 tarjetas de estadísticas del equipo (miembros, completado promedio, total, en riesgo)
- **Gráfico de barras:** Porcentaje de completado por departamento
- **Gráfico de líneas:** Completaciones por semana (tendencia mensual)
- **Tabla de progreso individual:** Avatar, nombre, departamento, barra de progreso, porcentaje, capacitaciones completadas — con badge "En riesgo" para empleados con bajo progreso
- Botón de exportar PDF

---

### 5.5 Recuperación de Contraseña (`/forgot-password`)

Nueva página para restablecer contraseña (antes el link en el login apuntaba a una ruta inexistente).

**Funcionalidades:**
- Formulario con validación de correo electrónico
- Estado de carga con spinner
- **Pantalla de confirmación** con ícono de check verde al enviar (sin recargar la página)
- Mensaje de instrucción sobre revisar spam
- Botón para volver al login

---

## 6. Resumen de Archivos Modificados / Creados

### Archivos Nuevos

```
proxy.ts                                    ← Protección de rutas por rol
app/api/auth/login/route.ts                 ← API de login
app/api/auth/logout/route.ts                ← API de logout
app/api/trainings/route.ts                  ← API de capacitaciones
app/api/employees/route.ts                  ← API de empleados
app/dashboard/trainings/page.tsx            ← Página Mis Capacitaciones
app/dashboard/achievements/page.tsx         ← Página Mis Logros
app/supervisor/reports/page.tsx             ← Página Reportes del Equipo
app/forgot-password/page.tsx                ← Página Recuperar Contraseña
components/analytics-charts.tsx             ← Gráficos lazy-loaded
CAMBIOS.md                                  ← Este documento
```

### Archivos Modificados

```
app/globals.css                             ← Nuevo tema claro + degradado de fondo
app/layout.tsx                              ← Tema por defecto → light
app/page.tsx                                ← Login con API real + manejo de errores
app/dashboard/profile/page.tsx              ← Sección de actividad completada
app/admin/analytics/page.tsx                ← Dynamic import de gráficos
app/admin/layout.tsx                        ← Ajuste de padding para topbar flotante
app/dashboard/layout.tsx                    ← Ajuste de padding para topbar flotante
components/upskill-logo.tsx                 ← Logo real circular con animación
components/stat-card.tsx                    ← Rediseño estilo Nebula Admin
components/training-card.tsx                ← Colores compatibles claro/oscuro
components/dashboard-topbar.tsx             ← Topbar flotante redondeado
components/dashboard-sidebar.tsx            ← Sidebar flotante redondeado + logout real
components/badge-grid.tsx                   ← Colores compatibles claro/oscuro
components/leaderboard.tsx                  ← Colores compatibles claro/oscuro
components/ui/card.tsx                      ← rounded-2xl + sombra personalizada
next.config.mjs                             ← Optimización de imágenes habilitada
```

---

## 7. Pendiente para Producción

Los siguientes puntos requieren configuración adicional antes de ir a producción:

1. **Base de datos** — Configurar Supabase (ver `README.md` y `supabase/migrations/`) y variables en `.env.local`
2. **Reemplazar datos mock** — Los archivos API tienen comentarios `// TODO` marcando dónde conectar Prisma
3. **Variables de entorno** — Crear archivo `.env` con `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
4. **Envío de correos** — La página de "Olvidé mi contraseña" tiene la UI lista pero necesita integrar un servicio de email (SendGrid, Resend, etc.)
5. **Exportar PDF** — El botón existe en Analíticas y Reportes pero requiere implementación (html2pdf.js o similar)

---

*Documento generado el 08 de Junio de 2026*
