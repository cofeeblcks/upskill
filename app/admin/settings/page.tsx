import { RoleCategoryManager } from "@/components/role-category-manager"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Configuración y Parámetros
          </h1>
          <p className="text-muted-foreground">
            Administra los roles de usuario y las categorías del sistema de capacitación.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <RoleCategoryManager />
      </div>
    </div>
  )
}
