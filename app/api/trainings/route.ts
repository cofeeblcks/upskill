import { NextResponse } from 'next/server'

// TODO: Replace with Prisma: import { prisma } from '@/lib/prisma'
const mockTrainings = [
  { id: '1', title: 'Seguridad en el Trabajo', category: 'Seguridad', duration: 45, status: 'active', assignedCount: 120, completedCount: 98 },
  { id: '2', title: 'Liderazgo Efectivo', category: 'Liderazgo', duration: 60, status: 'active', assignedCount: 45, completedCount: 32 },
  { id: '3', title: 'Cumplimiento Normativo', category: 'Cumplimiento', duration: 30, status: 'active', assignedCount: 156, completedCount: 140 },
  { id: '4', title: 'Herramientas Digitales', category: 'Técnico', duration: 40, status: 'active', assignedCount: 78, completedCount: 51 },
  { id: '5', title: 'Comunicación Efectiva', category: 'Habilidades Blandas', duration: 35, status: 'inactive', assignedCount: 60, completedCount: 42 },
]

export async function GET() {
  // TODO: Replace with: return NextResponse.json(await prisma.training.findMany())
  return NextResponse.json(mockTrainings)
}

export async function POST(request: Request) {
  const body = await request.json()
  // TODO: Replace with: const training = await prisma.training.create({ data: body })
  const training = { ...body, id: Date.now().toString(), assignedCount: 0, completedCount: 0 }
  return NextResponse.json(training, { status: 201 })
}
