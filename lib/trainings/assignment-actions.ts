import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { isUserEligibleForTraining } from "@/lib/trainings/eligibility";

type Sb = SupabaseClient<Database>;

/**
 * Crea filas en `assignments` validando rol/cargo y evitando duplicados.
 */
export async function createAssignmentsForUsers(
  sb: Sb,
  trainingId: string,
  userIds: string[],
  criteria: { requiredRoles: string[]; positions: string[] }
): Promise<
  | { ok: true; created: number }
  | { ok: false; status: number; error: string }
> {
  const requiredRoles = [...(criteria.requiredRoles ?? [])];
  const positions = [...(criteria.positions ?? [])];

  const { data: assignedRows } = await sb
    .from("assignments")
    .select("user_id")
    .eq("training_id", trainingId);
  const assignedSet = new Set((assignedRows ?? []).map((r) => r.user_id));

  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) {
    return { ok: false, status: 400, error: "No se enviaron usuarios." };
  }

  const { data: users, error: uErr } = await sb
    .from("users")
    .select("id, name, email, role, position, is_active")
    .in("id", uniqueIds);
  if (uErr) {
    return { ok: false, status: 500, error: uErr.message };
  }
  const byId = new Map((users ?? []).map((u) => [u.id, u]));

  const inserts: Array<{
    id: string;
    user_id: string;
    training_id: string;
    status: "NOT_STARTED";
    progress: number;
  }> = [];

  for (const uid of uniqueIds) {
    if (assignedSet.has(uid)) continue;
    const u = byId.get(uid);
    if (!u) {
      return {
        ok: false,
        status: 400,
        error: `Usuario desconocido: ${uid}`,
      };
    }
    if (!u.is_active) {
      return {
        ok: false,
        status: 400,
        error: `El usuario ${u.name} está inactivo.`,
      };
    }
    if (
      !isUserEligibleForTraining({
        userRole: u.role,
        userPosition: u.position,
        requiredRoles,
        trainingPositions: positions,
      })
    ) {
      return {
        ok: false,
        status: 400,
        error: `${u.name} no cumple los roles o cargos requeridos.`,
      };
    }
    inserts.push({
      id: globalThis.crypto.randomUUID(),
      user_id: uid,
      training_id: trainingId,
      status: "NOT_STARTED",
      progress: 0,
    });
  }

  if (inserts.length === 0) {
    return {
      ok: false,
      status: 400,
      error:
        "Ningún empleado nuevo para asignar (ya asignados o no elegibles).",
    };
  }

  const { error: insErr } = await sb.from("assignments").insert(inserts);
  if (insErr) {
    if (insErr.code === "23505") {
      return {
        ok: false,
        status: 409,
        error: "Alguno de los empleados ya tenía esta asignación.",
      };
    }
    return { ok: false, status: 500, error: insErr.message };
  }

  return { ok: true, created: inserts.length };
}
