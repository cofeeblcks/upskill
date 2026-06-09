"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type RoleRow = { id: string; name: string; description: string };
type CategoryRow = { id: string; name: string; color: string };

export function RoleCategoryManager() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "primary",
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        fetch("/api/settings/roles", { credentials: "same-origin" }),
        fetch("/api/settings/categories", { credentials: "same-origin" }),
      ]);
      if (!rRes.ok) {
        const j = await rRes.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Roles");
      }
      if (!cRes.ok) {
        const j = await cRes.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Categorías");
      }
      setRoles((await rRes.json()) as RoleRow[]);
      setCategories((await cRes.json()) as CategoryRow[]);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "No se pudo cargar la configuración. ¿Migraciones aplicadas?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleOpenRoleModal = (role?: RoleRow) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        color: "primary",
      });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "", color: "primary" });
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        const res = await fetch(`/api/settings/roles/${editingRole.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            code: formData.name.trim(),
            description: formData.description,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error ?? "Error al guardar");
        }
      } else {
        const res = await fetch("/api/settings/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            code: formData.name.trim(),
            description: formData.description,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error ?? "Error al crear");
        }
      }
      toast.success("Rol guardado");
      setIsRoleModalOpen(false);
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/roles/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "No se pudo eliminar");
      }
      toast.success("Rol eliminado");
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const handleOpenCategoryModal = (category?: CategoryRow) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        color: category.color || "primary",
        description: "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", color: "primary", description: "" });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        const res = await fetch(
          `/api/settings/categories/${editingCategory.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
              name: formData.name.trim(),
              color_variant: formData.color,
            }),
          }
        );
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error ?? "Error al guardar");
        }
      } else {
        const res = await fetch("/api/settings/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            name: formData.name.trim(),
            color_variant: formData.color,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error ?? "Error al crear");
        }
      }
      toast.success("Categoría guardada");
      setIsCategoryModalOpen(false);
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/categories/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "No se pudo eliminar");
      }
      toast.success("Categoría eliminada");
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando configuración…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="roles">Roles del Sistema</TabsTrigger>
          <TabsTrigger value="categories">Categorías de Capacitación</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Roles</h2>
              <p className="text-sm text-muted-foreground">
                Metadatos de roles (los códigos EMPLOYEE / SUPERVISOR / ADMIN_HR
                deben coincidir con los usuarios en base de datos).
              </p>
            </div>
            <Button onClick={() => handleOpenRoleModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Rol
            </Button>
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{role.name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenRoleModal(role)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => void handleDeleteRole(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No hay roles configurados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Categorías</h2>
              <p className="text-sm text-muted-foreground">
                Clasificación de capacitaciones (nombre único).
              </p>
            </div>
            <Button onClick={() => handleOpenCategoryModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre de Categoría</TableHead>
                  <TableHead>Color (Identificador)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge variant={(category.color as never) || "outline"}>
                        {category.color || "default"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenCategoryModal(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => void handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No hay categorías configuradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Actualiza los datos del rol."
                : "Agrega un rol al catálogo (código en MAYÚSCULAS)."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Código del rol</Label>
              <Input
                id="role-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value.toUpperCase(),
                  })
                }
                placeholder="EJEMPLO_ROL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Descripción</Label>
              <Input
                id="role-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Breve descripción"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSaveRole()} disabled={!formData.name}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              Nombre único y variante de color para la UI.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Desarrollo Personal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-color">Color (variante UI)</Label>
              <select
                id="cat-color"
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              >
                <option value="primary">Primario</option>
                <option value="secondary">Secundario</option>
                <option value="destructive">Destructivo</option>
                <option value="success">Éxito</option>
                <option value="warning">Advertencia</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void handleSaveCategory()}
              disabled={!formData.name}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
