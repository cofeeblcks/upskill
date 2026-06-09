"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Loader2, MoreHorizontal, Pencil, Trash2, Users, Eye, UserPlus } from "lucide-react"
import { toast } from "sonner"

interface Training {
  id: string
  title: string
  category: string
  durationMin: number
  requiredRoles: string[]
  positions?: string[]
  assignedCount: number
  completedCount: number
  isActive: boolean
  createdAt: string
}

interface TrainingTableProps {
  trainings: Training[]
  onEdit?: (training: Training) => void
  onDelete?: (training: Training) => Promise<void>
  onViewAssignments?: (training: Training) => void
}

const categoryColors: Record<string, string> = {
  Cumplimiento: "bg-blue-500/20 text-blue-400",
  Liderazgo: "bg-purple-500/20 text-purple-400",
  Técnico: "bg-emerald-500/20 text-emerald-400",
  Seguridad: "bg-orange-500/20 text-orange-400",
  "Habilidades Blandas": "bg-pink-500/20 text-pink-400",
}

const roleLabels: Record<string, string> = {
  EMPLOYEE: "Empleado",
  SUPERVISOR: "Supervisor",
  ADMIN_HR: "Admin HR",
}

export function TrainingTable({ trainings, onEdit, onDelete, onViewAssignments }: TrainingTableProps) {
  const router = useRouter()
  const [loadingRow, setLoadingRow] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Training | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [assignmentsTarget, setAssignmentsTarget] = useState<Training | null>(null)
  const [assignmentRows, setAssignmentRows] = useState<
    Array<{
      assignmentId: string
      userId: string
      name: string
      email: string
      role: string
      position: string
      status: string
      statusLabel: string
      progress: number
      score: number | null
    }>
  >([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null)

  const [assignTarget, setAssignTarget] = useState<Training | null>(null)
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [assignList, setAssignList] = useState<
    Array<{
      id: string
      name: string
      email: string
      role: string
      department: string
      position: string
    }>
  >([])
  const [assignMeta, setAssignMeta] = useState<{
    requiredRoles: string[]
    positions: string[]
    isActive: boolean
  } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [assignSaving, setAssignSaving] = useState(false)

  const handleEdit = (training: Training) => {
    if (onEdit) {
      onEdit(training)
    } else {
      router.push(`/admin/trainings/edit/${training.id}`)
    }
  }

  const handleViewAssignments = (training: Training) => {
    if (onViewAssignments) {
      onViewAssignments(training)
    } else {
      setAssignmentsTarget(training)
      setAssignmentRows([])
      setAssignmentsError(null)
    }
  }

  useEffect(() => {
    if (!assignmentsTarget || onViewAssignments) return
    let cancelled = false
    setAssignmentsLoading(true)
    setAssignmentsError(null)
    fetch(`/api/trainings/${assignmentsTarget.id}/assignments`, {
      credentials: "same-origin",
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string
          assignments?: typeof assignmentRows
        }
        if (!res.ok) throw new Error(data.error ?? "Error al cargar asignaciones")
        return data.assignments ?? []
      })
      .then((rows) => {
        if (!cancelled) setAssignmentRows(rows)
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setAssignmentsError(e.message)
          setAssignmentRows([])
        }
      })
      .finally(() => {
        if (!cancelled) setAssignmentsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [assignmentsTarget, onViewAssignments])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [assignTarget?.id])

  useEffect(() => {
    if (!assignTarget) {
      setAssignList([])
      setAssignMeta(null)
      setAssignError(null)
      return
    }
    let cancelled = false
    setAssignLoading(true)
    setAssignError(null)
    fetch(`/api/trainings/${assignTarget.id}/eligible-employees`, {
      credentials: "same-origin",
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string
          employees?: typeof assignList
          training?: {
            requiredRoles: string[]
            positions: string[]
            isActive: boolean
          }
        }
        if (!res.ok) throw new Error(data.error ?? "Error al cargar empleados")
        return data
      })
      .then((data) => {
        if (cancelled) return
        setAssignList(data.employees ?? [])
        if (data.training) {
          setAssignMeta({
            requiredRoles: data.training.requiredRoles,
            positions: data.training.positions,
            isActive: data.training.isActive,
          })
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setAssignError(e.message)
          setAssignList([])
          setAssignMeta(null)
        }
      })
      .finally(() => {
        if (!cancelled) setAssignLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [assignTarget])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      if (onDelete) {
        await onDelete(deleteTarget)
      } else {
        const res = await fetch(`/api/trainings/${deleteTarget.id}`, {
          method: "DELETE",
          credentials: "same-origin",
        })
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(data.error ?? "Error al eliminar")
        }
        toast.success(`"${deleteTarget.title}" eliminado correctamente`)
        router.refresh()
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Error al eliminar la capacitación"
      )
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleSubmitAssign = async () => {
    if (!assignTarget || selectedIds.size === 0) return
    setAssignSaving(true)
    try {
      const res = await fetch(`/api/trainings/${assignTarget.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ userIds: [...selectedIds] }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        created?: number
      }
      if (!res.ok) throw new Error(data.error ?? "Error al asignar")
      toast.success(
        data.created === 1
          ? "1 empleado asignado"
          : `${data.created ?? 0} empleados asignados`
      )
      setAssignTarget(null)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al asignar")
    } finally {
      setAssignSaving(false)
    }
  }

  const toggleAssignSelection = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const selectAllEligible = () => {
    setSelectedIds(new Set(assignList.map((e) => e.id)))
  }

  const clearAssignSelection = () => {
    setSelectedIds(new Set())
  }

  const handleToggleActive = async (training: Training) => {
    setLoadingRow(training.id)
    const newState = !training.isActive
    try {
      const res = await fetch(`/api/trainings/${training.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ isActive: newState }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Error al cambiar estado")
      }
      toast.success(
        newState
          ? `"${training.title}" activado`
          : `"${training.title}" desactivado`
      )
      router.refresh()
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Error al cambiar estado"
      )
    } finally {
      setLoadingRow(null)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground">Título</TableHead>
              <TableHead className="text-muted-foreground">Categoría</TableHead>
              <TableHead className="text-muted-foreground">Duración</TableHead>
              <TableHead className="text-muted-foreground">Roles</TableHead>
              <TableHead className="text-muted-foreground">Progreso</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No se encontraron capacitaciones
                </TableCell>
              </TableRow>
            ) : (
              trainings.map((training) => {
                const isRowLoading = loadingRow === training.id
                return (
                  <TableRow
                    key={training.id}
                    className={cn(
                      "hover:bg-secondary/50 transition-colors",
                      isRowLoading && "opacity-60"
                    )}
                  >
                    <TableCell className="font-medium text-foreground">
                      {training.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          categoryColors[training.category] ||
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {training.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {training.durationMin} min
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {training.requiredRoles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="border-border text-xs"
                          >
                            {roleLabels[role] || role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {training.completedCount}/{training.assignedCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border cursor-pointer select-none transition-all",
                          training.isActive
                            ? "border-success/30 bg-success/20 text-success hover:bg-success/30"
                            : "border-pending/30 bg-pending/20 text-pending hover:bg-pending/30"
                        )}
                        onClick={() => !isRowLoading && handleToggleActive(training)}
                      >
                        {isRowLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : training.isActive ? (
                          "Activo"
                        ) : (
                          "Inactivo"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isRowLoading}
                          >
                            {isRowLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(training)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!training.isActive}
                            onClick={() => {
                              if (training.isActive) setAssignTarget(training)
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Asignar empleados
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewAssignments(training)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Asignaciones
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(training)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar capacitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la capacitación{" "}
              <span className="font-medium text-foreground">"{deleteTarget?.title}"</span>{" "}
              y todas sus asignaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Assignments Dialog */}
      <Dialog open={!!assignmentsTarget} onOpenChange={(open) => !open && setAssignmentsTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignaciones de Capacitación</DialogTitle>
            <DialogDescription>
              Empleados asignados a "{assignmentsTarget?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
            {assignmentsLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {assignmentsError && (
              <p className="text-center text-sm text-destructive">{assignmentsError}</p>
            )}
            {!assignmentsLoading && !assignmentsError && assignmentRows.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No hay empleados asignados a esta capacitación.
              </p>
            )}
            {!assignmentsLoading &&
              assignmentRows.map((emp) => (
                <div
                  key={emp.assignmentId}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0 border border-border">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {emp.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium leading-none">
                        {emp.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {emp.email}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {emp.role}
                        {emp.position && emp.position !== "—" ? ` · ${emp.position}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-2 shrink-0",
                      emp.status === "COMPLETED"
                        ? "border-success/30 bg-success/10 text-success"
                        : emp.status === "IN_PROGRESS"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-warning/30 bg-warning/10 text-warning"
                    )}
                  >
                    {emp.statusLabel}
                  </Badge>
                </div>
              ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAssignmentsTarget(null)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!assignTarget}
        onOpenChange={(open) => !open && !assignSaving && setAssignTarget(null)}
      >
        <DialogContent className="flex max-h-[90vh] max-w-lg flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Asignar empleados</DialogTitle>
            <DialogDescription className="space-y-1">
              <span>
                Capacitación:{" "}
                <span className="font-medium text-foreground">
                  {assignTarget?.title}
                </span>
              </span>
              {assignMeta && (
                <span className="block text-xs">
                  Solo aparecen usuarios activos que cumplen los roles requeridos
                  {assignMeta.positions.length > 0
                    ? " y alguno de los cargos configurados en la capacitación"
                    : ""}{" "}
                  y aún no están asignados.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {assignLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {assignError && (
            <p className="text-center text-sm text-destructive">{assignError}</p>
          )}

          {!assignLoading && !assignError && assignList.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay empleados elegibles sin asignar. Revisa roles, cargos y
              asignaciones existentes.
            </p>
          )}

          {!assignLoading && assignList.length > 0 && (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={selectAllEligible}
                >
                  Seleccionar todos
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAssignSelection}
                >
                  Limpiar
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">
                  {selectedIds.size} seleccionados
                </span>
              </div>
              <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                {assignList.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50"
                  >
                    <Checkbox
                      checked={selectedIds.has(emp.id)}
                      onCheckedChange={() => toggleAssignSelection(emp.id)}
                      disabled={assignSaving}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{emp.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {emp.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {roleLabels[emp.role] ?? emp.role}
                        {emp.department ? ` · ${emp.department}` : ""}
                        {emp.position ? ` · ${emp.position}` : ""}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              type="button"
              disabled={assignSaving}
              onClick={() => setAssignTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={
                assignSaving || selectedIds.size === 0 || assignList.length === 0
              }
              onClick={handleSubmitAssign}
            >
              {assignSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Asignando…
                </>
              ) : (
                "Confirmar asignación"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
