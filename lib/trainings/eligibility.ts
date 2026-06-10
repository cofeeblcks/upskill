import type { AppRole } from "@/types/database.types";

/** Coincide rol del usuario con `required_roles` y cargo con `positions` (si la capacitación define posiciones). */
export function isUserEligibleForTraining(params: {
  userRole: string;
  userPosition: string | null;
  requiredRoles: string[];
  trainingPositions: string[];
}): boolean {
  const required = (params.requiredRoles ?? []).filter(Boolean) as AppRole[];
  if (required.length === 0) return false;
  if (!required.includes(params.userRole as AppRole)) return false;

  const posList = (params.trainingPositions ?? [])
    .map((p) => p.trim())
    .filter(Boolean);
  if (posList.length === 0) return true;

  const userPos = (params.userPosition ?? "").trim();
  // Sin cargo registrado: puede asignarse (RRHH aún no definió puesto).
  if (!userPos) return true;

  const low = userPos.toLowerCase();
  return posList.some((p) => p.trim().toLowerCase() === low);
}
