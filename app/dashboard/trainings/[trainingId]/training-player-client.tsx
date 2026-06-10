"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EmployeeTrainingDetail } from "@/lib/data/queries";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Play,
  Trophy,
  Video,
} from "lucide-react";
import { toast } from "sonner";

type Props = EmployeeTrainingDetail;

const statusConfig = {
  NOT_STARTED: {
    label: "Pendiente",
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "En Curso",
    className: "bg-warning/15 text-warning border-warning/30",
    icon: Play,
  },
  COMPLETED: {
    label: "Completado",
    className: "bg-success/15 text-success border-success/30",
    icon: CheckCircle2,
  },
} as const;

function materialType(url: string): "video" | "pdf" | "link" {
  const lower = url.toLowerCase();
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com")
  ) {
    return "video";
  }
  if (lower.endsWith(".pdf")) return "pdf";
  return "link";
}

export function TrainingPlayerClient({ training, assignment }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(assignment.status);
  const [progress, setProgress] = useState(assignment.progress);
  const [score, setScore] = useState(assignment.score);
  const [loading, setLoading] = useState<string | null>(null);

  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const fileUrl = training.fileUrl?.trim() || null;
  const matType = fileUrl ? materialType(fileUrl) : null;

  async function patchAssignment(
    body: Record<string, unknown>,
    loadingKey: string
  ) {
    setLoading(loadingKey);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo actualizar la capacitación");
        return null;
      }
      return data as {
        status?: string;
        progress?: number;
        pointsEarned?: number;
      };
    } catch {
      toast.error("Error de conexión");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function handleStart() {
    const data = await patchAssignment({ action: "start" }, "start");
    if (!data) return;
    setStatus("IN_PROGRESS");
    setProgress(data.progress ?? 10);
    toast.success("Capacitación iniciada");
    window.dispatchEvent(new Event("upskill:progress-updated"));
    router.refresh();
  }

  async function handleProgress(value: number) {
    const data = await patchAssignment(
      { action: "progress", progress: value },
      `progress-${value}`
    );
    if (!data) return;
    setStatus("IN_PROGRESS");
    setProgress(value);
    toast.success(`Progreso actualizado a ${value}%`);
    window.dispatchEvent(new Event("upskill:progress-updated"));
    router.refresh();
  }

  async function handleComplete() {
    const data = await patchAssignment({ action: "complete" }, "complete");
    if (!data) return;
    setStatus("COMPLETED");
    setProgress(100);
    setScore(100);
    toast.success(
      data.pointsEarned
        ? `¡Capacitación completada! +${data.pointsEarned} puntos`
        : "¡Capacitación completada!"
    );
    window.dispatchEvent(new Event("upskill:progress-updated"));
    router.refresh();
  }

  async function handleOpenMaterial() {
    if (!fileUrl) return;
    if (status === "NOT_STARTED") {
      await handleStart();
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
          <Link href="/dashboard/trainings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
            {training.title}
          </h1>
          <p className="text-sm text-muted-foreground">{training.category}</p>
        </div>
        <Badge
          variant="outline"
          className={cn("shrink-0 border text-xs", config.className)}
        >
          <StatusIcon className="mr-1 h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {training.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {training.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                Material de apoyo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fileUrl ? (
                <>
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                    {matType === "video" ? (
                      <Video className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    ) : matType === "pdf" ? (
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {matType === "video"
                          ? "Video de capacitación"
                          : matType === "pdf"
                            ? "Documento PDF"
                            : "Enlace externo"}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {fileUrl}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full rounded-xl sm:w-auto"
                    onClick={handleOpenMaterial}
                    disabled={loading !== null}
                  >
                    {loading === "start" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Abrir material
                  </Button>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">
                    Sin material adjunto
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Puedes completar la capacitación igualmente. Si necesitas
                    material, contacta a RRHH.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tu progreso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Duración estimada: {training.durationMin} min
              </div>

              {assignment.dueDateLabel && (
                <p className="text-sm text-muted-foreground">
                  Vence:{" "}
                  <span className="font-medium text-foreground">
                    {assignment.dueDateLabel}
                  </span>
                </p>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-semibold text-foreground">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {status === "COMPLETED" && (
                <div className="rounded-xl bg-success/10 p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium text-success">
                    <Trophy className="h-4 w-4" />
                    Completada
                  </div>
                  {assignment.completedAtLabel && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {assignment.completedAtLabel}
                    </p>
                  )}
                  {score != null && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Puntuación: {score}%
                    </p>
                  )}
                </div>
              )}

              {status === "NOT_STARTED" && (
                <Button
                  className="w-full rounded-xl"
                  onClick={handleStart}
                  disabled={loading !== null}
                >
                  {loading === "start" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Comenzar capacitación
                </Button>
              )}

              {status === "IN_PROGRESS" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Actualiza tu avance al revisar el material:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((value) => (
                      <Button
                        key={value}
                        variant={progress >= value ? "default" : "outline"}
                        size="sm"
                        className="rounded-lg"
                        onClick={() => handleProgress(value)}
                        disabled={loading !== null}
                      >
                        {loading === `progress-${value}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          `${value}%`
                        )}
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="w-full rounded-xl"
                    onClick={handleComplete}
                    disabled={loading !== null}
                  >
                    {loading === "complete" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Marcar como completada
                  </Button>
                </div>
              )}

              {status === "COMPLETED" && fileUrl && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() =>
                    window.open(fileUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver material nuevamente
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
