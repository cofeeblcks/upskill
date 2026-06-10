"use client";

import { useEffect, useMemo, useState } from "react";
import { TrainingCard } from "@/components/training-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

export type EmployeeTrainingRow = {
  id: string;
  assignmentId: string;
  title: string;
  category: string;
  duration: number;
  progress: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  dueDate?: string;
  fileUrl?: string | null;
};

const FILTERS = ["Todos", "Pendiente", "En Curso", "Completado"] as const;
type Filter = (typeof FILTERS)[number];

const filterMap: Record<Filter, string | null> = {
  Todos: null,
  Pendiente: "NOT_STARTED",
  "En Curso": "IN_PROGRESS",
  Completado: "COMPLETED",
};

export function TrainingsClient({
  initialTrainings,
}: {
  initialTrainings: EmployeeTrainingRow[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("Todos");
  const [trainings, setTrainings] = useState(initialTrainings);

  useEffect(() => {
    setTrainings(initialTrainings);
  }, [initialTrainings]);

  const filtered = useMemo(() => {
    return trainings.filter((t) => {
      const matchesStatus =
        !filterMap[filter] || t.status === filterMap[filter];
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [trainings, search, filter]);

  const counts = useMemo(
    () => ({
      Todos: trainings.length,
      Pendiente: trainings.filter((t) => t.status === "NOT_STARTED").length,
      "En Curso": trainings.filter((t) => t.status === "IN_PROGRESS").length,
      Completado: trainings.filter((t) => t.status === "COMPLETED").length,
    }),
    [trainings]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mis Capacitaciones
        </h1>
        <p className="text-muted-foreground">
          Revisa y completa todas tus capacitaciones asignadas.
        </p>
      </div>

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
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setFilter(f)}
            >
              {f}
              <Badge
                variant="secondary"
                className="ml-2 rounded-full px-1.5 py-0 text-xs"
              >
                {counts[f]}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-foreground">Sin resultados</p>
          <p className="text-sm text-muted-foreground">
            Intenta con otro término o filtro.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => (
            <TrainingCard key={t.id} {...t} />
          ))}
        </div>
      )}
    </div>
  );
}
