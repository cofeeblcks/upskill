import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, BadgeType } from "@/types/database.types";

type Sb = SupabaseClient<Database>;

async function awardBadgeIfNew(
  sb: Sb,
  userId: string,
  type: BadgeType
): Promise<void> {
  const { data: existing } = await sb
    .from("badges")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .maybeSingle();
  if (existing) return;

  await sb.from("badges").insert({
    id: globalThis.crypto.randomUUID(),
    user_id: userId,
    type,
  });
}

export async function completeAssignment(
  sb: Sb,
  assignmentId: string,
  userId: string,
  score?: number
): Promise<
  | { ok: true; pointsEarned: number }
  | { ok: false; status: number; error: string }
> {
  const { data: assignment, error: aErr } = await sb
    .from("assignments")
    .select("id, user_id, training_id, status, due_date, started_at")
    .eq("id", assignmentId)
    .maybeSingle();

  if (aErr) {
    return { ok: false, status: 500, error: aErr.message };
  }
  if (!assignment || assignment.user_id !== userId) {
    return { ok: false, status: 404, error: "Asignación no encontrada" };
  }
  if (assignment.status === "COMPLETED") {
    return { ok: false, status: 400, error: "Esta capacitación ya está completada" };
  }

  const finalScore = score ?? 100;
  const now = new Date().toISOString();
  const pointsEarned = finalScore * 3;

  const { error: updErr } = await sb
    .from("assignments")
    .update({
      status: "COMPLETED",
      progress: 100,
      score: finalScore,
      completed_at: now,
      started_at: assignment.started_at ?? now,
    })
    .eq("id", assignmentId);

  if (updErr) {
    return { ok: false, status: 500, error: updErr.message };
  }

  const { data: user } = await sb
    .from("users")
    .select("points")
    .eq("id", userId)
    .maybeSingle();

  const { error: ptsErr } = await sb
    .from("users")
    .update({ points: (user?.points ?? 0) + pointsEarned })
    .eq("id", userId);

  if (ptsErr) {
    return { ok: false, status: 500, error: ptsErr.message };
  }

  const { count: completedCount } = await sb
    .from("assignments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "COMPLETED");

  if (completedCount === 1) {
    await awardBadgeIfNew(sb, userId, "FIRST_TRAINING");
  }

  if (
    assignment.due_date &&
    new Date(now) < new Date(assignment.due_date)
  ) {
    await awardBadgeIfNew(sb, userId, "EARLY_BIRD");
  }

  if (finalScore === 100) {
    await awardBadgeIfNew(sb, userId, "PERFECT_SCORE");
  }

  return { ok: true, pointsEarned };
}
