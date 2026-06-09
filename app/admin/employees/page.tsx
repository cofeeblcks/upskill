"use client"

import { useState, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "lucide-react"
import { toast } from "sonner"

// Mock employees data
const initialEmployees = [
  {
    id: "1",
    name: "Ana García",
    email: "ana.garcia@empresa.com",
    role: "EMPLOYEE",
    position: "Analista Senior",
    department: "Finanzas",
    points: 3200,
    completedTrainings: 10,
    totalTrainings: 10,
    isActive: true,
  },
  {
    id: "2",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@empresa.com",
    role: "EMPLOYEE",
    position: "Analista",
    department: "Finanzas",
    points: 2450,
    completedTrainings: 8,
    totalTrainings: 12,
    isActive: true,
  },
  {
    id: "3",
    name: "Roberto Díaz",
    email: "roberto.diaz@empresa.com",
    role: "SUPERVISOR",
    position: "Gerente",
    department: "Operaciones",
    points: 1850,
    completedTrainings: 6,
    totalTrainings: 8,
    isActive: true,
  },
  {
    id: "4",
    name: "Laura Sánchez",
    email: "laura.sanchez@empresa.com",
    role: "EMPLOYEE",
    position: "Coordinadora",
    department: "RRHH",
    points: 2650,
    completedTrainings: 9,
    totalTrainings: 11,
    isActive: true,
  },
  {
    id: "5",
    name: "Miguel Torres",
    email: "miguel.torres@empresa.com",
    role: "EMPLOYEE",
    position: "Analista",
    department: "Ventas",
    points: 2890,
    completedTrainings: 7,
    totalTrainings: 10,
    isActive: true,
  },
  {
    id: "6",
    name: "María González",
    email: "maria.gonzalez@empresa.com",
    role: "ADMIN_HR",
    position: "Directora RRHH",
    department: "RRHH",
    points: 0,
    completedTrainings: 5,
    totalTrainings: 5,
    isActive: true,
  },
]

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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees)
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("Todos")
  const [role, setRole] = useState("Todos")
  const [loadingRow, setLoadingRow] = useState<string | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<(typeof initialEmployees)[0] | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false)
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

  const handleViewProfile = (employee: (typeof initialEmployees)[0]) => {
    toast.info(`Perfil de ${employee.name}`)
  }

  const handleEdit = (employee: (typeof initialEmployees)[0]) => {
    toast.info(`Editando ${employee.name}`)
  }

  const handleViewTrainings = async (employee: (typeof initialEmployees)[0]) => {
    setLoadingRow(employee.id)
    await new Promise((res) => setTimeout(res, 700))
    setLoadingRow(null)
    toast.success(`Capacitaciones de ${employee.name} cargadas`)
  }

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return
    setIsDeactivating(true)
    try {
      await new Promise((res) => setTimeout(res, 1000))
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === deactivateTarget.id ? { ...e, isActive: false } : e
        )
      )
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
      const addedEmployee = {
        id: Date.now().toString(),
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        position: newEmployee.position,
        department: newEmployee.department,
        points: 0,
        completedTrainings: 0,
        totalTrainings: 0,
        isActive: true,
      }
      
      setEmployees(prev => [...prev, addedEmployee])
      toast.success("Empleado agregado exitosamente")
      setIsAddEmployeeModalOpen(false)
      setNewEmployee({ name: "", email: "", department: "", role: "EMPLOYEE", position: "" })
    } catch {
      toast.error("Error al agregar el empleado")
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
                const isRowLoading = loadingRow === employee.id

                return (
                  <TableRow
                    key={employee.id}
                    className={cn(
                      "hover:bg-secondary/50 transition-colors",
                      !employee.isActive && "opacity-50",
                      isRowLoading && "opacity-60"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={undefined} alt={employee.name} />
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
    </div>
  )
}
