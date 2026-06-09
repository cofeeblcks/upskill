"use client"

import type { AdminEmployeeRow } from "@/lib/data/queries"
import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  Download,
  Loader2,
  MoreHorizontal,
  Search,
  UserPlus,
  X,
  BookOpen,
} from "lucide-react"
import { toast } from "sonner"

const roleLabels: Record<string, { label: string; className: string }> = {
  EMPLOYEE: { label: "Empleado", className: "bg-blue-500/20 text-blue-400" },
  SUPERVISOR: { label: "Supervisor", className: "bg-purple-500/20 text-purple-400" },
  ADMIN_HR: { label: "Admin HR", className: "bg-emerald-500/20 text-emerald-400" },
}

const departments = ["Todos", "Finanzas", "Operaciones", "RRHH", "Ventas", "TI", "Marketing"]
const roles = ["Todos", "Empleado", "Supervisor", "Admin HR"]

const roleFilterMap: Record<string, string> = {
  "Empleado": "EMPLOYEE",
  "Supervisor": "SUPERVISOR",
  "Admin HR": "ADMIN_HR",
}

type EmployeeDetailApi = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  points: number;
  isActive: boolean;
  createdAt: string;
  supervisorId: string | null;
  completedTrainings: number;
  totalTrainings: number;
  assignments: Array<{
    assignmentId: string;
    trainingId: string;
    title: string;
    category: string;
    durationMin: number;
    status: string;
    statusLabel: string;
    progress: number;
    score: number | null;
    updatedAt: string;
  }>;
};

export function AdminEmployeesClient({
  initialEmployees,
}: {
  initialEmployees: AdminEmployeeRow[];
}) {
  const [employees, setEmployees] = useState<AdminEmployeeRow[]>(initialEmployees)

  useEffect(() => {
    setEmployees(initialEmployees)
  }, [initialEmployees])

  async function refetchEmployees() {
    const res = await fetch("/api/employees", { credentials: "same-origin" });
    if (res.ok) {
      const data = (await res.json()) as AdminEmployeeRow[];
      setEmployees(data);
    }
  }
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("Todos")
  const [role, setRole] = useState("Todos")
  const [deactivateTarget, setDeactivateTarget] = useState<AdminEmployeeRow | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false)
  const [employeeModal, setEmployeeModal] = useState<
    null | { type: "profile" | "trainings" | "edit"; id: string }
  >(null)
  const [detail, setDetail] = useState<EmployeeDetailApi | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    role: "EMPLOYEE" as "EMPLOYEE" | "SUPERVISOR" | "ADMIN_HR",
  })
  const [editSaving, setEditSaving] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "",
    role: "EMPLOYEE",
    position: "",
  })

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
      const matchesDept = department === "Todos" || e.department === department
      const matchesRole = role === "Todos" || e.role === roleFilterMap[role]
      return matchesSearch && matchesDept && matchesRole
    })
  }, [employees, search, department, role])

  const hasActiveFilters = search || department !== "Todos" || role !== "Todos"

  const clearFilters = () => {
    setSearch("")
    setDepartment("Todos")
    setRole("Todos")
  }

  useEffect(() => {
    if (!employeeModal || employeeModal.type === "edit") {
      if (!employeeModal) setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    fetch(`/api/employees/${employeeModal.id}`, { credentials: "same-origin" })
      .then(async (res) => {
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
        } & Partial<EmployeeDetailApi>;
        if (!res.ok) throw new Error(j.error ?? "Error al cargar el empleado");
        return j as EmployeeDetailApi;
      })
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setDetailError(e.message);
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [employeeModal]);

  const clearEmployeeModal = () => {
    setEmployeeModal(null);
    setDetail(null);
    setDetailError(null);
  };

  const handleViewProfile = (employee: AdminEmployeeRow) => {
    setEmployeeModal({ type: "profile", id: employee.id });
  };

  const handleEdit = (employee: AdminEmployeeRow) => {
    setEmployeeModal({ type: "edit", id: employee.id });
    setEditForm({
      name: employee.name,
      email: employee.email,
      department: employee.department === "—" ? "" : employee.department,
      position: employee.position === "—" ? "" : employee.position,
      role: employee.role as "EMPLOYEE" | "SUPERVISOR" | "ADMIN_HR",
    });
  };

  const handleViewTrainings = (employee: AdminEmployeeRow) => {
    setEmployeeModal({ type: "trainings", id: employee.id });
  };

  const handleSaveEdit = async () => {
    if (!employeeModal || employeeModal.type !== "edit") return;
    if (
      !editForm.name.trim() ||
      !editForm.email.trim() ||
      !editForm.department.trim() ||
      !editForm.position.trim()
    ) {
      toast.error("Completa nombre, correo, departamento y cargo");
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/employees/${employeeModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          department: editForm.department.trim(),
          position: editForm.position.trim(),
          role: editForm.role,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Error al guardar");
      }
      await refetchEmployees();
      toast.success("Empleado actualizado");
      clearEmployeeModal();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return
    setIsDeactivating(true)
    try {
      const res = await fetch(`/api/employees/${deactivateTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ isActive: false }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "Error")
      }
      await refetchEmployees()
      toast.success(`${deactivateTarget.name} fue desactivado`)
    } catch {
      toast.error("Error al desactivar el empleado")
    } finally {
      setIsDeactivating(false)
      setDeactivateTarget(null)
    }
  }

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department || !newEmployee.position) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: newEmployee.name,
          email: newEmployee.email,
          department: newEmployee.department,
          role: newEmployee.role,
          position: newEmployee.position,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "Error")
      }
      await refetchEmployees()
      toast.success("Empleado agregado exitosamente")
      setIsAddEmployeeModalOpen(false)
      setNewEmployee({
        name: "",
        email: "",
        department: "",
        role: "EMPLOYEE",
        position: "",
      })
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Error al agregar el empleado"
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Empleados
          </h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios y sus asignaciones de capacitación.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setIsAddEmployeeModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Empleado
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar empleado..."
            className="bg-secondary pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[180px] bg-secondary">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[150px] bg-secondary">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
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

      {/* Result count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "empleado encontrado" : "empleados encontrados"}
      </p>

      {/* Employees Table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground">Empleado</TableHead>
              <TableHead className="text-muted-foreground">Rol</TableHead>
              <TableHead className="text-muted-foreground">Departamento</TableHead>
              <TableHead className="text-muted-foreground">Progreso</TableHead>
              <TableHead className="text-muted-foreground">Puntos</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No se encontraron empleados
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((employee) => {
                const initials = employee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                const completionRate =
                  employee.totalTrainings > 0
                    ? Math.round(
                        (employee.completedTrainings / employee.totalTrainings) * 100
                      )
                    : 0
                const roleConfig = roleLabels[employee.role]

                return (
                  <TableRow
                    key={employee.id}
                    className={cn(
                      "hover:bg-secondary/50 transition-colors",
                      !employee.isActive && "opacity-50"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {employee.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", roleConfig.className)}
                      >
                        {roleConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {employee.department}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[150px]">
                        <Progress
                          value={completionRate}
                          className="h-2 flex-1"
                        />
                        <span
                          className={cn(
                            "text-sm w-10 font-medium",
                            completionRate === 100
                              ? "text-success"
                              : completionRate >= 70
                              ? "text-primary"
                              : "text-warning"
                          )}
                        >
                          {completionRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-primary">
                        {employee.points.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProfile(employee)}>
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(employee)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewTrainings(employee)}>
                            Ver Capacitaciones
                          </DropdownMenuItem>
                          {employee.isActive && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeactivateTarget(employee)}
                              >
                                Desactivar
                              </DropdownMenuItem>
                            </>
                          )}
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

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && !isDeactivating && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              El empleado{" "}
              <span className="font-medium text-foreground">
                "{deactivateTarget?.name}"
              </span>{" "}
              perderá acceso a la plataforma. Puedes reactivarlo en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateConfirm}
              disabled={isDeactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desactivando...
                </>
              ) : (
                "Desactivar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Employee Modal */}
      <Dialog open={isAddEmployeeModalOpen} onOpenChange={setIsAddEmployeeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Empleado</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo empleado. Se enviará un correo con las instrucciones de acceso.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Ej: Juan Pérez"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.perez@empresa.com"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                placeholder="Ej: Analista de datos"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select
                  value={newEmployee.department}
                  onValueChange={(val) => setNewEmployee({ ...newEmployee, department: val })}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.filter(d => d !== "Todos").map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={newEmployee.role}
                  onValueChange={(val) => setNewEmployee({ ...newEmployee, role: val })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    <SelectItem value="ADMIN_HR">Admin HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmployeeModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEmployee}>
              Guardar Empleado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={employeeModal?.type === "profile"}
        onOpenChange={(open) => !open && clearEmployeeModal()}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Perfil del empleado</DialogTitle>
            <DialogDescription>
              Datos registrados y resumen de capacitaciones.
            </DialogDescription>
          </DialogHeader>
          {detailLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {detailError && (
            <p className="text-center text-sm text-destructive">{detailError}</p>
          )}
          {!detailLoading && detail && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border border-border">
                  <AvatarFallback className="bg-primary/20 text-lg text-primary">
                    {detail.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{detail.name}</p>
                  <p className="text-sm text-muted-foreground">{detail.email}</p>
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rol</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      roleLabels[detail.role]?.className ?? ""
                    )}
                  >
                    {roleLabels[detail.role]?.label ?? detail.role}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Departamento</span>
                  <span>{detail.department || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cargo</span>
                  <span>{detail.position || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Puntos</span>
                  <span className="font-medium text-primary">
                    {detail.points.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <span>{detail.isActive ? "Activo" : "Inactivo"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alta</span>
                  <span>
                    {new Date(detail.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Capacitaciones</span>
                  <span>
                    {detail.completedTrainings} completadas /{" "}
                    {detail.totalTrainings} asignadas
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={clearEmployeeModal}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={employeeModal?.type === "trainings"}
        onOpenChange={(open) => !open && clearEmployeeModal()}
      >
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Capacitaciones asignadas
            </DialogTitle>
            <DialogDescription>
              {detail?.name
                ? `Listado para ${detail.name}`
                : "Cargando…"}
            </DialogDescription>
          </DialogHeader>
          {detailLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {detailError && (
            <p className="text-center text-sm text-destructive">{detailError}</p>
          )}
          {!detailLoading && detail && (
            <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border">
              {detail.assignments.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Este empleado no tiene capacitaciones asignadas.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Capacitación</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Progreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.assignments.map((a) => (
                      <TableRow key={a.assignmentId}>
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {a.category}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {a.statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {a.progress}%
                          {a.score != null ? ` · ${a.score} pts` : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={clearEmployeeModal}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={employeeModal?.type === "edit"}
        onOpenChange={(open) => !open && !editSaving && clearEmployeeModal()}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar empleado</DialogTitle>
            <DialogDescription>
              Actualiza los datos del empleado. El correo debe ser único.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre completo</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                disabled={editSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo electrónico</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
                disabled={editSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position">Cargo</Label>
              <Input
                id="edit-position"
                value={editForm.position}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, position: e.target.value }))
                }
                disabled={editSaving}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select
                  value={editForm.department}
                  onValueChange={(val) =>
                    setEditForm((f) => ({ ...f, department: val }))
                  }
                  disabled={editSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((d) => d !== "Todos")
                      .map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(val) =>
                    setEditForm((f) => ({
                      ...f,
                      role: val as typeof editForm.role,
                    }))
                  }
                  disabled={editSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    <SelectItem value="ADMIN_HR">Admin HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={clearEmployeeModal}
              disabled={editSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={editSaving}>
              {editSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
