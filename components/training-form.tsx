"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const categories = [
  "Cumplimiento",
  "Liderazgo",
  "Técnico",
  "Seguridad",
  "Habilidades Blandas",
];

const roles = [
  { id: "EMPLOYEE", label: "Empleado" },
  { id: "SUPERVISOR", label: "Supervisor" },
  { id: "ADMIN_HR", label: "Admin HR" },
];

const positions = [
  "Analista",
  "Coordinador",
  "Gerente",
  "Director",
  "Técnico",
  "Asistente",
];

const roleLabels: Record<string, string> = {
  EMPLOYEE: "Empleado",
  SUPERVISOR: "Supervisor",
  ADMIN_HR: "Admin HR",
};

type PreviewEmployee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
};

interface FormData {
  title: string;
  description: string;
  category: string;
  duration: string;
  fileUrl: string;
}

export type TrainingFormInitial = {
  title: string;
  description: string;
  category: string;
  durationMin: number;
  fileUrl: string;
  requiredRoles: string[];
  positions: string[];
};

type TrainingFormProps = {
  mode?: "create" | "edit";
  trainingId?: string;
  initialValues?: TrainingFormInitial;
};

export function TrainingForm({
  mode = "create",
  trainingId,
  initialValues,
}: TrainingFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit" && trainingId;

  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    initialValues?.requiredRoles ?? []
  );
  const [selectedPositions, setSelectedPositions] = useState<string[]>(
    initialValues?.positions ?? []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    category: initialValues?.category ?? "",
    duration: initialValues ? String(initialValues.durationMin) : "",
    fileUrl: initialValues?.fileUrl ?? "",
  });
  const [errors, setErrors] = useState<
    Partial<FormData & { roles: string }>
  >({});

  const [previewList, setPreviewList] = useState<PreviewEmployee[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [assignUserIds, setAssignUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isEdit) return;
    if (selectedRoles.length === 0) {
      setPreviewList([]);
      setAssignUserIds(new Set());
      return;
    }

    let cancelled = false;
    const handle = setTimeout(() => {
      setPreviewLoading(true);
      fetch("/api/trainings/preview-eligible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          requiredRoles: selectedRoles,
          positions: selectedPositions,
        }),
      })
        .then(async (res) => {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            employees?: PreviewEmployee[];
          };
          if (!res.ok) throw new Error(data.error ?? "Error al cargar candidatos");
          return data.employees ?? [];
        })
        .then((list) => {
          if (cancelled) return;
          setPreviewList(list);
          setAssignUserIds((prev) => {
            const next = new Set<string>();
            for (const e of list) {
              if (prev.has(e.id)) next.add(e.id);
            }
            return next;
          });
        })
        .catch(() => {
          if (!cancelled) {
            setPreviewList([]);
            setAssignUserIds(new Set());
          }
        })
        .finally(() => {
          if (!cancelled) setPreviewLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [isEdit, selectedRoles, selectedPositions]);

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
    if (errors.roles) setErrors((e) => ({ ...e, roles: undefined }));
  };

  const togglePosition = (position: string) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const toggleAssignUser = (id: string) => {
    setAssignUserIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const selectAllPreview = () => {
    setAssignUserIds(new Set(previewList.map((e) => e.id)));
  };

  const clearAssignSelection = () => {
    setAssignUserIds(new Set());
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) newErrors.title = "El título es requerido";
    if (!isEdit && !formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }
    if (!formData.category) newErrors.category = "Selecciona una categoría";
    if (!formData.duration || Number(formData.duration) <= 0) {
      newErrors.duration = "Ingresa una duración válida";
    }
    if (selectedRoles.length === 0) {
      newErrors.roles = "Selecciona al menos un rol";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsLoading(true);
    try {
      const descriptionTrim = formData.description.trim();
      const body = {
        title: formData.title.trim(),
        description: descriptionTrim.length > 0 ? descriptionTrim : null,
        category: formData.category,
        duration: Number(formData.duration),
        fileUrl: formData.fileUrl.trim() || null,
        requiredRoles: selectedRoles,
        positions: selectedPositions,
      };

      const url = isEdit ? `/api/trainings/${trainingId}` : "/api/trainings";
      const method = isEdit ? "PATCH" : "POST";

      const payload = isEdit
        ? body
        : {
            ...body,
            isActive: true,
            assignUserIds: [...assignUserIds],
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Error al guardar la capacitación");
      }

      toast.success(
        isEdit ? "Cambios guardados" : "Capacitación creada exitosamente",
        {
          icon: <CheckCircle2 className="h-4 w-4 text-success" />,
        }
      );
      router.push("/admin/trainings");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Error al guardar la capacitación. Inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Título de la Capacitación{" "}
              <span className="text-destructive">*</span>
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
              Descripción{" "}
              {!isEdit && <span className="text-destructive">*</span>}
              {isEdit && (
                <span className="text-muted-foreground"> (opcional)</span>
              )}
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
                <SelectTrigger
                  className={`bg-secondary ${errors.category ? "border-destructive" : ""}`}
                >
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
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            className={`flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragOver
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary"
            }`}
          >
            <div className="pointer-events-none text-center">
              <Upload
                className={`mx-auto h-10 w-10 transition-colors ${isDragOver ? "text-primary" : "text-muted-foreground"}`}
              />
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
          <CardTitle>
            {isEdit ? "Roles y posiciones" : "Roles y posiciones objetivo"}
          </CardTitle>
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
            <Label>Posiciones (opcional)</Label>
            <p className="text-xs text-muted-foreground">
              Si marcas cargos, solo empleados con ese puesto coinciden. Si no
              tienen cargo en RRHH, también pueden coincidir. La comparación no
              distingue mayúsculas.
            </p>
            <div className="flex flex-wrap gap-4">
              {positions.map((position) => (
                <div key={position} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pos-${position}`}
                    checked={selectedPositions.includes(position)}
                    onCheckedChange={() => togglePosition(position)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`pos-${position}`} className="cursor-pointer">
                    {position}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Los cambios en roles y posiciones no reasignan automáticamente a los empleados ya inscritos; solo afectan nuevas asignaciones."
              : "Puedes asignar empleados en la siguiente sección al guardar, o más tarde desde la tabla de capacitaciones."}
          </p>
        </CardContent>
      </Card>

      {!isEdit && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Asignar empleados al crear</CardTitle>
            <p className="text-sm text-muted-foreground">
              Lista según roles y cargos elegidos (solo usuarios activos).
              Opcional.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRoles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Selecciona al menos un rol para ver candidatos.
              </p>
            )}
            {selectedRoles.length > 0 && previewLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {selectedRoles.length > 0 &&
              !previewLoading &&
              previewList.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay empleados activos que cumplan estos criterios.
                </p>
              )}
            {selectedRoles.length > 0 &&
              !previewLoading &&
              previewList.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={selectAllPreview}
                      disabled={isLoading}
                    >
                      Seleccionar todos
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAssignSelection}
                      disabled={isLoading}
                    >
                      Limpiar
                    </Button>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {assignUserIds.size} seleccionados
                    </span>
                  </div>
                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                    {previewList.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-secondary/50"
                      >
                        <Checkbox
                          checked={assignUserIds.has(emp.id)}
                          onCheckedChange={() => toggleAssignUser(emp.id)}
                          disabled={isLoading}
                        />
                        <div className="min-w-0 flex-1 text-sm">
                          <span className="font-medium">{emp.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {emp.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {roleLabels[emp.role] ?? emp.role}
                            {emp.department ? ` · ${emp.department}` : ""}
                            {emp.position ? ` · ${emp.position}` : ""}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
          </CardContent>
        </Card>
      )}

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
              {isEdit ? "Guardando…" : "Creando…"}
            </>
          ) : isEdit ? (
            "Guardar cambios"
          ) : (
            "Crear Capacitación"
          )}
        </Button>
      </div>
    </form>
  );
}
