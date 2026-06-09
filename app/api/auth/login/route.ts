import { NextResponse } from 'next/server'

const DEMO_USERS = [
  { email: 'admin@empresa.com', password: '123456', role: 'ADMIN_HR', name: 'María González' },
  { email: 'supervisor@empresa.com', password: '123456', role: 'SUPERVISOR', name: 'Carlos Mendoza' },
  { email: 'empleado@empresa.com', password: '123456', role: 'EMPLOYEE', name: 'Ana García' },
]

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password)

  if (!user) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const payload = JSON.stringify({ role: user.role, name: user.name, email: user.email })
  const response = NextResponse.json({ role: user.role, name: user.name })

  response.cookies.set('upskill-session', payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
