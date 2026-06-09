import { NextResponse } from 'next/server'

// TODO: Replace with Prisma: import { prisma } from '@/lib/prisma'
const mockEmployees = [
  { id: '1', name: 'Ana García', email: 'ana.garcia@empresa.com', department: 'Ventas', role: 'EMPLOYEE', points: 2450, progress: 78, status: 'active' },
  { id: '2', name: 'Carlos Mendoza', email: 'carlos.mendoza@empresa.com', department: 'TI', role: 'SUPERVISOR', points: 3120, progress: 91, status: 'active' },
  { id: '3', name: 'Laura Sánchez', email: 'laura.sanchez@empresa.com', department: 'RRHH', role: 'EMPLOYEE', points: 1890, progress: 65, status: 'active' },
  { id: '4', name: 'Miguel Torres', email: 'miguel.torres@empresa.com', department: 'Finanzas', role: 'EMPLOYEE', points: 2780, progress: 83, status: 'active' },
  { id: '5', name: 'Roberto Díaz', email: 'roberto.diaz@empresa.com', department: 'Operaciones', role: 'EMPLOYEE', points: 1560, progress: 54, status: 'inactive' },
  { id: '6', name: 'María González', email: 'maria.gonzalez@empresa.com', department: 'RRHH', role: 'ADMIN_HR', points: 4200, progress: 96, status: 'active' },
]

export async function GET() {
  // TODO: Replace with: return NextResponse.json(await prisma.user.findMany())
  return NextResponse.json(mockEmployees)
}
