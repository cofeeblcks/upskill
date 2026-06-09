"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UpSkillLogo } from "@/components/upskill-logo"
import { ArrowRight, BookOpen, Loader2, Trophy, Users, AlertCircle } from "lucide-react"
import Image from "next/image"

const ROLE_PATHS: Record<string, string> = {
  ADMIN_HR: '/admin',
  SUPERVISOR: '/supervisor',
  EMPLOYEE: '/dashboard',
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al iniciar sesión')
        return
      }

      const { role } = await res.json()
      router.push(ROLE_PATHS[role] ?? '/dashboard')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-secondary p-12 lg:flex">
        <UpSkillLogo />

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
            Potencia el desarrollo <br />
            <span className="text-primary">de tu equipo</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            La plataforma de gestión de capacitaciones que transforma el aprendizaje
            en una experiencia gamificada y motivadora.
          </p>

          <div className="grid gap-4 pt-4">
            <div className="flex items-center gap-4 rounded-xl bg-card/50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Capacitaciones Personalizadas</p>
                <p className="text-sm text-muted-foreground">Contenido adaptado a cada rol</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-card/50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Gamificación Integrada</p>
                <p className="text-sm text-muted-foreground">Puntos, insignias y rankings</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-card/50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="font-medium text-foreground">Seguimiento de Equipos</p>
                <p className="text-sm text-muted-foreground">Métricas en tiempo real</p>
              </div>
            </div>
          </div>

        </div>

        <p className="text-sm text-muted-foreground">
          © 2026 UpSkill. Todos los derechos reservados.
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="relative flex w-full items-center justify-center p-8 lg:w-1/2 overflow-hidden">
        <Image
          src="/images/bg-login.png"
          alt="Login Background"
          fill
          priority
          className="absolute inset-0 z-0 object-cover"
        />
        <div className="absolute inset-0 z-0 bg-background/40" />

        <Card className="relative z-10 w-full max-w-md border-border bg-card/50 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mb-4 flex justify-center lg:hidden">
              <UpSkillLogo />
            </div>
            <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  className="bg-secondary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-secondary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    Ingresar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Contacta a RRHH
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
