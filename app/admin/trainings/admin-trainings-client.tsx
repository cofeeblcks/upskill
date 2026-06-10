"use client";

import { useMemo, useState } from "react";
import { TrainingTable } from "@/components/training-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";

export type AdminTrainingRow = {
  id: string;
  title: string;
  category: string;
  durationMin: number;
  requiredRoles: string[];
  positions: string[];
  assignedCount: number;
  completedCount: number;
  isActive: boolean;
  createdAt: string;
};

const categories = [
  "Todas",
  "Seguridad",
  "Liderazgo",
  "Cumplimiento",
  "Técnico",
  "Habilidades Blandas",
];
const statuses = ["Todos", "Activos", "Inactivos"];

export function AdminTrainingsClient({
  initialTrainings,
}: {
  initialTrainings: AdminTrainingRow[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todos");

  const filtered = useMemo(() => {
    return initialTrainings.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "Todas" || t.category === category;
      const matchesStatus =
        status === "Todos" ||
        (status === "Activos" && t.isActive) ||
        (status === "Inactivos" && !t.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [initialTrainings, search, category, status]);

  const hasActiveFilters = search || category !== "Todas" || status !== "Todos";

  const clearFilters = () => {
    setSearch("");
    setCategory("Todas");
    setStatus("Todos");
  };

  return (
    <div className="space-y-6">
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

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[250px] flex-1">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length}{" "}
        {filtered.length === 1
          ? "capacitación encontrada"
          : "capacitaciones encontradas"}
      </p>

      <TrainingTable trainings={filtered} />
    </div>
  );
}
