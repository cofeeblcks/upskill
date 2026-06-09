"use client"

import { useState } from "react"
import { TrainingCard } from "@/components/training-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

const allTrainings = [
  { id: "1", title: "Seguridad en el Trabajo: Protocolos y Mejores Prácticas", category: "Seguridad", duration: 45, progress: 75, status: "IN_PROGRESS" as const, dueDate: "15 Ene 2025" },
  { id: "2", title: "Liderazgo Efectivo para Supervisores", category: "Liderazgo", duration: 60, progress: 0, status: "NOT_STARTED" as const, dueDate: "22 Ene 2025" },
  { id: "3", title: "Cumplimiento Normativo y Ética Empresarial", category: "Cumplimiento", duration: 30, progress: 100, status: "COMPLETED" as const },
  { id: "4", title: "Herramientas Digitales para el Trabajo Moderno", category: "Técnico", duration: 40, progress: 100, status: "COMPLETED" as const },
  { id: "5", title: "Comunicación Efectiva en Equipos", category: "Habilidades Blandas", duration: 35, progress: 100, status: "COMPLETED" as const },
  { id: "6", title: "Gestión del Tiempo y Productividad", category: "Habilidades Blandas", duration: 50, progress: 30, status: "IN_PROGRESS" as const, dueDate: "30 Ene 2025" },
  { id: "7", title: "Primeros Auxilios Básicos", category: "Seguridad", duration: 25, progress: 0, status: "NOT_STARTED" as const, dueDate: "5 Feb 2025" },
  { id: "8", title: "Excel Avanzado para Finanzas", category: "Técnico", duration: 55, progress: 0, status: "NOT_STARTED" as const, dueDate: "10 Feb 2025" },
]

const FILTERS = ["Todos", "Pendiente", "En Curso", "Completado"] as const
type Filter = typeof FILTERS[number]

const filterMap: Record<Filter, string | null> = {
  "Todos":      null,
  "Pendiente":  "NOT_STARTED",
  "En Curso":   "IN_PROGRESS",
  "Completado": "COMPLETED",
}

export default function TrainingsPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("Todos")

  const filtered = allTrainings.filter((t) => {
    const matchesStatus = !filterMap[filter] || t.status === filterMap[filter]
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const counts = {
    "Todos":      allTrainings.length,
    "Pendiente":  allTrainings.filter((t) => t.status === "NOT_STARTED").length,
    "En Curso":   allTrainings.filter((t) => t.status === "IN_PROGRESS").length,
    "Completado": allTrainings.filter((t) => t.status === "COMPLETED").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Capacitaciones</h1>
        <p className="text-muted-foreground">Revisa y completa todas tus capacitaciones asignadas.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar capacitación..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setFilter(f)}
            >
              {f}
              <Badge variant="secondary" className="ml-2 rounded-full px-1.5 py-0 text-xs">
                {counts[f]}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-foreground">Sin resultados</p>
          <p className="text-sm text-muted-foreground">Intenta con otro término o filtro.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => (
            <TrainingCard key={t.id} {...t} />
          ))}
        </div>
      )}
    </div>
  )
}
