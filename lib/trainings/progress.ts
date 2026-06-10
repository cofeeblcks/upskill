import type { TrainingStatus } from "@/types/database.types";

export type AssignmentProgressSlice = {
  status: TrainingStatus;
  progress: number;
};

export type AggregatedProgress = {
  completed: number;
  total: number;
  progressPercent: number;
};

/** Promedio de `progress` por asignación + conteo de completadas. */
export function aggregateAssignmentProgress(
  assignments: AssignmentProgressSlice[]
): AggregatedProgress {
  const total = assignments.length;
  if (total === 0) {
    return { completed: 0, total: 0, progressPercent: 0 };
  }
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const progressPercent = Math.round(
    assignments.reduce((sum, a) => sum + a.progress, 0) / total
  );
  return { completed, total, progressPercent };
}

export function buildUserProgressMap(
  assignments: Array<{
    user_id: string;
    status: TrainingStatus;
    progress: number;
  }>
): Map<string, AggregatedProgress> {
  const byUser = new Map<string, AssignmentProgressSlice[]>();
  for (const row of assignments) {
    const list = byUser.get(row.user_id) ?? [];
    list.push({ status: row.status, progress: row.progress });
    byUser.set(row.user_id, list);
  }

  const result = new Map<string, AggregatedProgress>();
  for (const [userId, list] of byUser) {
    result.set(userId, aggregateAssignmentProgress(list));
  }
  return result;
}
