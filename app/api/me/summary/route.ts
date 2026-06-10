import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/api/session";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  aggregateAssignmentProgress,
  type AssignmentProgressSlice,
} from "@/lib/trainings/progress";

function unavailable() {
  return NextResponse.json(
    {
      error:
        "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    },
    { status: 503 }
  );
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const sb = createServiceRoleClient();
    const { data: user, error: uErr } = await sb
      .from("users")
      .select("name, email, points, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { data: assignments } = await sb
      .from("assignments")
      .select("status, progress")
      .eq("user_id", userId);

    const slices: AssignmentProgressSlice[] = (assignments ?? []).map((a) => ({
      status: a.status,
      progress: a.progress,
    }));
    const agg = aggregateAssignmentProgress(slices);

    return NextResponse.json({
      name: user.name,
      email: user.email,
      points: user.points,
      avatar: user.avatar_url ?? undefined,
      completedTrainings: agg.completed,
      totalTrainings: agg.total,
      overallProgressPercent: agg.progressPercent,
    });
  } catch {
    return unavailable();
  }
}
