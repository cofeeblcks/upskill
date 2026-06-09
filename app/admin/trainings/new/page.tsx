import { TrainingForm } from "@/components/training-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewTrainingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nueva Capacitación
          </h1>
          <p className="text-muted-foreground">
            Crea una nueva capacitación y asígnala automáticamente a los
            empleados.
          </p>
        </div>
      </div>

      <TrainingForm />
    </div>
  )
}
