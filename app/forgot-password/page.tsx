"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UpSkillLogo } from "@/components/upskill-logo"
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("")
  const [isLoading, setLoading] = useState(false)
  const [sent, setSent]         = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((res) => setTimeout(res, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #dbeafe 0%, #ccfbf1 40%, #d1fae5 75%, #e0f2fe 100%)" }}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <UpSkillLogo />
        </div>

        <Card>
          <CardHeader className="text-center space-y-1">
            <div className="flex justify-center mb-2">
              {sent
                ? <CheckCircle2 className="h-12 w-12 text-success" />
                : <Mail className="h-12 w-12 text-primary" />
              }
            </div>
            <CardTitle className="text-2xl font-bold">
              {sent ? "¡Correo Enviado!" : "¿Olvidaste tu contraseña?"}
            </CardTitle>
            <CardDescription>
              {sent
                ? `Enviamos instrucciones de recuperación a ${email}. Revisa tu bandeja de entrada.`
                : "Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña."
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success text-center">
                  Si no ves el correo, revisa tu carpeta de spam.
                </div>
                <Button variant="outline" className="w-full rounded-xl" asChild>
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio de sesión
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                  ) : (
                    "Enviar instrucciones"
                  )}
                </Button>
                <Button variant="ghost" className="w-full rounded-xl" asChild>
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio de sesión
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
