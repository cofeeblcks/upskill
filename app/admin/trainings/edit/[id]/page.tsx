import { TrainingForm } from "@/components/training-form"

export default function EditTrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Editar Capacitación
        </h1>
        <p className="text-muted-foreground">
          Modifica los detalles de la capacitación existente.
        </p>
      </div>

      <TrainingForm />
    </div>
  )
}
