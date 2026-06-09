"use client"

import { useState, useMemo } from "react"
import { TrainingTable } from "@/components/training-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, X } from "lucide-react"
import Link from "next/link"

// Mock trainings data
const mockTrainings = [
  {
    id: "1",
    title: "Seguridad en el Trabajo: Protocolos y Mejores Prácticas",
    category: "Seguridad",
    durationMin: 45,
    requiredRoles: ["EMPLOYEE", "SUPERVISOR"],
    assignedCount: 120,
    completedCount: 95,
    isActive: true,
    createdAt: "2024-12-01",
  },
  {
    id: "2",
    title: "Liderazgo Efectivo para Supervisores",
    category: "Liderazgo",
    durationMin: 60,
    requiredRoles: ["SUPERVISOR"],
    assignedCount: 25,
    completedCount: 18,
    isActive: true,
    createdAt: "2024-12-05",
  },
  {
    id: "3",
    title: "Cumplimiento Normativo y Ética Empresarial",
    category: "Cumplimiento",
    durationMin: 30,
    requiredRoles: ["EMPLOYEE", "SUPERVISOR", "ADMIN_HR"],
    assignedCount: 156,
    completedCount: 142,
    isActive: true,
    createdAt: "2024-11-15",
  },
  {
    id: "4",
    title: "Introducción a Herramientas Digitales",
    category: "Técnico",
    durationMin: 40,
    requiredRoles: ["EMPLOYEE"],
    assignedCount: 80,
    completedCount: 45,
    isActive: true,
    createdAt: "2024-12-10",
  },
  {
    id: "5",
    title: "Comunicación Efectiva en el Equipo",
    category: "Habilidades Blandas",
    durationMin: 35,
    requiredRoles: ["EMPLOYEE", "SUPERVISOR"],
    assignedCount: 100,
    completedCount: 67,
    isActive: false,
    createdAt: "2024-10-20",
  },
  {
    id: "6",
    title: "Primeros Auxilios y Emergencias",
    category: "Seguridad",
    durationMin: 50,
    requiredRoles: ["EMPLOYEE"],
    assignedCount: 90,
    completedCount: 72,
    isActive: true,
    createdAt: "2024-11-25",
  },
  {
    id: "7",
    title: "Gestión del Tiempo y Productividad",
    category: "Habilidades Blandas",
    durationMin: 25,
    requiredRoles: ["EMPLOYEE", "SUPERVISOR"],
    assignedCount: 110,
    completedCount: 88,
    isActive: true,
    createdAt: "2024-12-08",
  },
]

const categories = ["Todas", "Seguridad", "Liderazgo", "Cumplimiento", "Técnico", "Habilidades Blandas"]
const statuses = ["Todos", "Activos", "Inactivos"]

export default function TrainingsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todas")
  const [status, setStatus] = useState("Todos")

  const filtered = useMemo(() => {
    return mockTrainings.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === "Todas" || t.category === category
      const matchesStatus =
        status === "Todos" ||
        (status === "Activos" && t.isActive) ||
        (status === "Inactivos" && !t.isActive)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [search, category, status])

  const hasActiveFilters = search || category !== "Todas" || status !== "Todos"

  const clearFilters = () => {
    setSearch("")
    setCategory("Todas")
    setStatus("Todos")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Capacitaciones
          </h1>
          <p className="text-muted-foreground">
            Gestiona todas las capacitaciones del sistema.
          </p>
        </div>
        <Link href="/admin/trainings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Capacitación
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar capacitación..."
            className="bg-secondary pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px] bg-secondary">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px] bg-secondary">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="mr-1 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "capacitación encontrada" : "capacitaciones encontradas"}
      </p>

      {/* Training Table */}
      <TrainingTable trainings={filtered} />
    </div>
  )
}
