import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getSessionUserId } from "@/lib/api/session";
import { assignmentProgressBodySchema } from "@/lib/schemas/assignment-progress";
import { completeAssignment } from "@/lib/trainings/complete-assignment";
import { revalidateProgressViews } from "@/lib/revalidate-progress";

function unavailable() {
  return NextResponse.json(
    {
      error:
        "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    },
    { status: 503 }
  );
}

async function getOwnedAssignment(
  sb: ReturnType<typeof createServiceRoleClient>,
  assignmentId: string,
  userId: string
) {
  const { data, error } = await sb
    .from("assignments")
    .select(
      "id, user_id, training_id, status, progress, score, due_date, started_at, completed_at"
    )
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) {
    return { error: NextResponse.json({ error: error.message }, { status: 500 }) };
  }
  if (!data || data.user_id !== userId) {
    return {
      error: NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 }),
    };
  }
  return { data };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ assignmentId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { assignmentId } = await context.params;

  try {
    const sb = createServiceRoleClient();
    const result = await getOwnedAssignment(sb, assignmentId, userId);
    if ("error" in result && result.error) return result.error;

    const a = result.data!;
    const { data: training } = await sb
      .from("trainings")
      .select("id, title, description, category, duration_min, file_url")
      .eq("id", a.training_id)
      .maybeSingle();

    return NextResponse.json({
      assignment: {
        id: a.id,
        trainingId: a.training_id,
        status: a.status,
        progress: a.progress,
        score: a.score,
        dueDate: a.due_date,
        startedAt: a.started_at,
        completedAt: a.completed_at,
      },
      training: training
        ? {
            id: training.id,
            title: training.title,
            description: training.description,
            category: training.category,
            durationMin: training.duration_min,
            fileUrl: training.file_url,
          }
        : null,
    });
  } catch {
    return unavailable();
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ assignmentId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { assignmentId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = assignmentProgressBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const sb = createServiceRoleClient();
    const result = await getOwnedAssignment(sb, assignmentId, userId);
    if ("error" in result && result.error) return result.error;

    const assignment = result.data!;
    const now = new Date().toISOString();

    if (parsed.data.action === "start") {
      if (assignment.status === "COMPLETED") {
        return NextResponse.json(
          { error: "Esta capacitación ya está completada" },
          { status: 400 }
        );
      }

      const progress =
        assignment.status === "NOT_STARTED"
          ? Math.max(assignment.progress, 10)
          : assignment.progress;

      const { error } = await sb
        .from("assignments")
        .update({
          status: "IN_PROGRESS",
          started_at: assignment.started_at ?? now,
          progress,
        })
        .eq("id", assignmentId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      revalidateProgressViews();

      return NextResponse.json({
        success: true,
        status: "IN_PROGRESS",
        progress,
        startedAt: assignment.started_at ?? now,
      });
    }

    if (parsed.data.action === "progress") {
      if (assignment.status === "COMPLETED") {
        return NextResponse.json(
          { error: "No se puede modificar el progreso de una capacitación completada" },
          { status: 400 }
        );
      }

      const { error } = await sb
        .from("assignments")
        .update({
          status: "IN_PROGRESS",
          progress: parsed.data.progress,
          started_at: assignment.started_at ?? now,
        })
        .eq("id", assignmentId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      revalidateProgressViews();

      return NextResponse.json({
        success: true,
        status: "IN_PROGRESS",
        progress: parsed.data.progress,
      });
    }

    const completeResult = await completeAssignment(
      sb,
      assignmentId,
      userId,
      parsed.data.score
    );

    if (!completeResult.ok) {
      return NextResponse.json(
        { error: completeResult.error },
        { status: completeResult.status }
      );
    }

    revalidateProgressViews();

    return NextResponse.json({
      success: true,
      status: "COMPLETED",
      progress: 100,
      pointsEarned: completeResult.pointsEarned,
    });
  } catch {
    return unavailable();
  }
}
