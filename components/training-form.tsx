"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const categories = [
  "Cumplimiento",
  "Liderazgo",
  "Técnico",
  "Seguridad",
  "Habilidades Blandas",
]

const roles = [
  { id: "EMPLOYEE", label: "Empleado" },
  { id: "SUPERVISOR", label: "Supervisor" },
  { id: "ADMIN_HR", label: "Admin HR" },
]

const positions = [
  "Analista",
  "Coordinador",
  "Gerente",
  "Director",
  "Técnico",
  "Asistente",
]

interface FormData {
  title: string
  description: string
  category: string
  duration: string
  fileUrl: string
}

export function TrainingForm() {
  const router = useRouter()
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedPositions, setSelectedPositions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    duration: "",
    fileUrl: "",
  })
  const [errors, setErrors] = useState<Partial<FormData & { roles: string }>>({})

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    )
    if (errors.roles) setErrors((e) => ({ ...e, roles: undefined }))
  }

  const togglePosition = (position: string) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    )
  }

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!formData.title.trim()) newErrors.title = "El título es requerido"
    if (!formData.description.trim()) newErrors.description = "La descripción es requerida"
    if (!formData.category) newErrors.category = "Selecciona una categoría"
    if (!formData.duration || Number(formData.duration) <= 0)
      newErrors.duration = "Ingresa una duración válida"
    if (selectedRoles.length === 0) newErrors.roles = "Selecciona al menos un rol"
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1500))
      toast.success("Capacitación creada exitosamente", {
        icon: <CheckCircle2 className="h-4 w-4 text-success" />,
      })
      router.push("/admin/trainings")
    } catch {
      toast.error("Error al crear la capacitación. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Título de la Capacitación <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ej: Seguridad en el Trabajo"
              className={`bg-secondary ${errors.title ? "border-destructive" : ""}`}
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe el contenido y objetivos de la capacitación..."
              className={`min-h-[100px] bg-secondary ${errors.description ? "border-destructive" : ""}`}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(v) => handleChange("category", v)}
                disabled={isLoading}
              >
                <SelectTrigger className={`bg-secondary ${errors.category ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">
                Duración (minutos) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                placeholder="45"
                min={1}
                className={`bg-secondary ${errors.duration ? "border-destructive" : ""}`}
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                disabled={isLoading}
              />
              {errors.duration && (
                <p className="text-xs text-destructive">{errors.duration}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Material de Capacitación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileUrl">URL del Material (PDF o Video)</Label>
            <Input
              id="fileUrl"
              placeholder="https://example.com/material.pdf"
              className="bg-secondary"
              value={formData.fileUrl}
              onChange={(e) => handleChange("fileUrl", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false) }}
            className={`flex items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
              isDragOver
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary"
            }`}
          >
            <div className="text-center pointer-events-none">
              <Upload className={`mx-auto h-10 w-10 transition-colors ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
              <p className="mt-2 text-sm font-medium text-foreground">
                Arrastra archivos aquí o haz clic para subir
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, MP4 hasta 100MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Asignación Automática</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>
              Roles Requeridos <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.id}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={role.id} className="cursor-pointer">
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.roles && (
              <p className="text-xs text-destructive">{errors.roles}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Posiciones (Opcional)</Label>
            <div className="flex flex-wrap gap-4">
              {positions.map((position) => (
                <div key={position} className="flex items-center space-x-2">
                  <Checkbox
                    id={position}
                    checked={selectedPositions.includes(position)}
                    onCheckedChange={() => togglePosition(position)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={position} className="cursor-pointer">
                    {position}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            La capacitación se asignará automáticamente a todos los empleados
            que cumplan con los roles y posiciones seleccionadas.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Capacitación"
          )}
        </Button>
      </div>
    </form>
  )
}
