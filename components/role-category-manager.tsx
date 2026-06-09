"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// Initial mock data
const initialRoles = [
  { id: "1", name: "EMPLOYEE", description: "Acceso básico a capacitaciones asignadas" },
  { id: "2", name: "SUPERVISOR", description: "Gestión de equipo y reportes básicos" },
  { id: "3", name: "ADMIN_HR", description: "Acceso total al sistema y configuraciones" },
]

const initialCategories = [
  { id: "1", name: "Seguridad", color: "destructive" },
  { id: "2", name: "Liderazgo", color: "primary" },
  { id: "3", name: "Cumplimiento", color: "warning" },
  { id: "4", name: "Técnico", color: "success" },
  { id: "5", name: "Habilidades Blandas", color: "info" },
]

export function RoleCategoryManager() {
  const [roles, setRoles] = useState(initialRoles)
  const [categories, setCategories] = useState(initialCategories)
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  
  const [editingRole, setEditingRole] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  
  const [formData, setFormData] = useState({ name: "", description: "", color: "" })

  // Role Actions
  const handleOpenRoleModal = (role?: any) => {
    if (role) {
      setEditingRole(role)
      setFormData({ name: role.name, description: role.description || "", color: "" })
    } else {
      setEditingRole(null)
      setFormData({ name: "", description: "", color: "" })
    }
    setIsRoleModalOpen(true)
  }

  const handleSaveRole = () => {
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...formData } : r))
    } else {
      setRoles([...roles, { id: Date.now().toString(), name: formData.name, description: formData.description }])
    }
    setIsRoleModalOpen(false)
  }

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id))
  }

  // Category Actions
  const handleOpenCategoryModal = (category?: any) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, color: category.color || "primary", description: "" })
    } else {
      setEditingCategory(null)
      setFormData({ name: "", color: "primary", description: "" })
    }
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = () => {
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: formData.name, color: formData.color } : c))
    } else {
      setCategories([...categories, { id: Date.now().toString(), name: formData.name, color: formData.color }])
    }
    setIsCategoryModalOpen(false)
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="roles">Roles del Sistema</TabsTrigger>
          <TabsTrigger value="categories">Categorías de Capacitación</TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Roles</h2>
              <p className="text-sm text-muted-foreground">Gestiona los roles y sus descripciones.</p>
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
                    <TableCell className="text-muted-foreground">{role.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenRoleModal(role)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteRole(role.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      No hay roles configurados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Categorías</h2>
              <p className="text-sm text-muted-foreground">Administra las categorías para clasificar capacitaciones.</p>
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
                      <Badge variant={category.color as any || "default"}>
                        {category.color || "default"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenCategoryModal(category)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      No hay categorías configuradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Role Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
            <DialogDescription>
              {editingRole ? "Actualiza los datos del rol en el sistema." : "Agrega un nuevo rol al sistema."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Nombre del Rol (Ej: ADMIN, SUPERVISOR)</Label>
              <Input 
                id="role-name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                placeholder="EJEMPLO_ROL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Descripción</Label>
              <Input 
                id="role-desc" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Breve descripción de los permisos"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveRole} disabled={!formData.name}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Modifica el nombre o color de la categoría." : "Crea una nueva clasificación para las capacitaciones."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre de la Categoría</Label>
              <Input 
                id="cat-name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Desarrollo Personal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-color">Color (Variante UI)</Label>
              <select 
                id="cat-color"
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
              >
                <option value="primary">Primario (Azul)</option>
                <option value="secondary">Secundario (Gris)</option>
                <option value="destructive">Destructivo (Rojo)</option>
                <option value="success">Éxito (Verde)</option>
                <option value="warning">Advertencia (Amarillo)</option>
                <option value="info">Info (Celeste)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCategory} disabled={!formData.name}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
