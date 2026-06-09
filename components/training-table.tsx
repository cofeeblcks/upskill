"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Loader2, MoreHorizontal, Pencil, Trash2, Users, Eye } from "lucide-react"
import { toast } from "sonner"

interface Training {
  id: string
  title: string
  category: string
  durationMin: number
  requiredRoles: string[]
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
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      if (onDelete) {
        await onDelete(deleteTarget)
      } else {
        // Simulate async delete
        await new Promise((res) => setTimeout(res, 1200))
        toast.success(`"${deleteTarget.title}" eliminado correctamente`)
      }
    } catch {
      toast.error("Error al eliminar la capacitación")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleToggleActive = async (training: Training) => {
    setLoadingRow(training.id)
    try {
      await new Promise((res) => setTimeout(res, 800))
      const newState = !training.isActive
      toast.success(
        newState
          ? `"${training.title}" activado`
          : `"${training.title}" desactivado`
      )
    } catch {
      toast.error("Error al cambiar estado")
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
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Mock Assigned Employees List */}
            {[
              { name: "Ana García", email: "ana.garcia@empresa.com", role: "Empleado", status: "Completado" },
              { name: "Carlos Mendoza", email: "carlos.mendoza@empresa.com", role: "Empleado", status: "En Progreso" },
              { name: "Laura Sánchez", email: "laura.sanchez@empresa.com", role: "Coordinadora", status: "Pendiente" },
              { name: "Miguel Torres", email: "miguel.torres@empresa.com", role: "Analista", status: "Completado" },
              { name: "Roberto Díaz", email: "roberto.diaz@empresa.com", role: "Supervisor", status: "Pendiente" },
            ].map((emp, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {emp.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{emp.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{emp.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  emp.status === "Completado" ? "text-success border-success/30 bg-success/10" : 
                  emp.status === "En Progreso" ? "text-primary border-primary/30 bg-primary/10" : 
                  "text-warning border-warning/30 bg-warning/10"
                )}>
                  {emp.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAssignmentsTarget(null)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
