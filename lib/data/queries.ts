import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { BADGE_CATALOG } from "@/lib/badges-catalog";
import type { SessionPayload } from "@/lib/session";

function db() {
  try {
    return createServiceRoleClient();
  } catch {
    return null;
  }
}

export async function resolveUserId(session: SessionPayload): Promise<string | null> {
  const sb = db();
  if (!sb) return null;
  if (session.id) return session.id;
  const { data } = await sb
    .from("users")
    .select("id")
    .eq("email", session.email)
    .maybeSingle();
  return data?.id ?? null;
}

function formatDue(d: string | null): string | undefined {
  if (!d) return undefined;
  try {
    return new Date(d).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return undefined;
  }
}

function formatShort(d: string): string {
  try {
    return new Date(d).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export type EmployeeDashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
    points: number;
    completedTrainings: number;
    totalTrainings: number;
    streak: number;
    rank: number;
  };
  trainings: Array<{
    id: string;
    title: string;
    category: string;
    duration: number;
    progress: number;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    dueDate?: string;
  }>;
  badges: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    earnedAt?: string;
    isEarned: boolean;
  }>;
  leaderboard: Array<{
    rank: number;
    name: string;
    points: number;
    avatar?: string;
    isCurrentUser?: boolean;
  }>;
};

export async function getEmployeeDashboard(
  userId: string
): Promise<EmployeeDashboardData | null> {
  const sb = db();
  if (!sb) return null;

  const { data: user, error: uErr } = await sb
    .from("users")
    .select("id, name, email, points")
    .eq("id", userId)
    .maybeSingle();
  if (uErr || !user) return null;

  const { data: assignments } = await sb
    .from("assignments")
    .select("id, status, progress, due_date, training_id")
    .eq("user_id", userId);

  const rows = assignments ?? [];
  const tids = [...new Set(rows.map((r) => r.training_id))];
  const { data: trainingRows } =
    tids.length > 0
      ? await sb
          .from("trainings")
          .select("id, title, category, duration_min")
          .in("id", tids)
      : { data: [] as const };
  const tMap = new Map((trainingRows ?? []).map((t) => [t.id, t]));

  const trainings = rows.map((a) => {
    const t = tMap.get(a.training_id);
    const title = t?.title ?? "Capacitación";
    const category = t?.category ?? "—";
    const duration = t?.duration_min ?? 0;
    return {
      id: a.training_id,
      title,
      category,
      duration,
      progress: a.progress,
      status: a.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
      dueDate: formatDue(a.due_date),
    };
  });

  const completedTrainings = rows.filter((r) => r.status === "COMPLETED").length;
  const totalTrainings = rows.length;

  const { data: earnedBadges } = await sb
    .from("badges")
    .select("id, type, awarded_at")
    .eq("user_id", userId);

  const earnedSet = new Map(
    (earnedBadges ?? []).map((b) => [b.type, b] as const)
  );

  const badges = Object.keys(BADGE_CATALOG).map((type) => {
    const meta = BADGE_CATALOG[type];
    const earned = earnedSet.get(type as never);
    return {
      id: earned?.id ?? type,
      type,
      name: meta.name,
      description: meta.description,
      earnedAt: earned?.awarded_at
        ? formatShort(earned.awarded_at)
        : undefined,
      isEarned: !!earned,
    };
  });

  const { data: leaders } = await sb
    .from("users")
    .select("id, name, points")
    .eq("role", "EMPLOYEE")
    .order("points", { ascending: false })
    .limit(5);

  const list = leaders ?? [];
  const leaderboard = list.map((row, i) => ({
    rank: i + 1,
    name: row.name,
    points: row.points,
    avatar: undefined as string | undefined,
    isCurrentUser: row.id === userId,
  }));

  const { count: betterCount } = await sb
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "EMPLOYEE")
    .gt("points", user.points);

  const rank = (betterCount ?? 0) + 1;

  const streak = Math.min(
    10,
    rows.filter((r) => r.status === "COMPLETED").length
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.points,
      completedTrainings,
      totalTrainings,
      streak,
      rank,
    },
    trainings,
    badges,
    leaderboard,
  };
}

export type AdminOverview = {
  stats: {
    totalTrainings: number;
    activeTrainings: number;
    totalAssignments: number;
    activeEmployees: number;
    completionRate: number;
    avgScore: number;
  };
  trainings: Array<{
    id: string;
    title: string;
    category: string;
    durationMin: number;
    requiredRoles: string[];
    positions: string[];
    assignedCount: number;
    completedCount: number;
    isActive: boolean;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    training: string;
    time: string;
  }>;
};

export async function getAdminOverview(): Promise<AdminOverview | null> {
  const sb = db();
  if (!sb) return null;

  const { data: trainingsRows } = await sb.from("trainings").select("*");
  const trainingsList = trainingsRows ?? [];

  const { data: assigns } = await sb
    .from("assignments")
    .select("id, status, score, training_id");
  const allA = assigns ?? [];
  const totalA = allA.length;
  const completedA = allA.filter((a) => a.status === "COMPLETED").length;
  const scores = allA.map((a) => a.score).filter((s): s is number => s != null);
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const { count: empCount } = await sb
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "EMPLOYEE")
    .eq("is_active", true);

  const byTraining = new Map<string, { assigned: number; completed: number }>();
  for (const row of allA) {
    const tid = row.training_id;
    if (!tid) continue;
    const cur = byTraining.get(tid) ?? { assigned: 0, completed: 0 };
    cur.assigned += 1;
    if (row.status === "COMPLETED") cur.completed += 1;
    byTraining.set(tid, cur);
  }

  const trainings = trainingsList.map((t) => {
    const stats = byTraining.get(t.id) ?? { assigned: 0, completed: 0 };
    return {
      id: t.id,
      title: t.title,
      category: t.category,
      durationMin: t.duration_min,
      requiredRoles: [...(t.required_roles ?? [])],
      positions: [...(t.positions ?? [])],
      assignedCount: stats.assigned,
      completedCount: stats.completed,
      isActive: t.is_active,
      createdAt: t.created_at?.slice(0, 10) ?? "",
    };
  });

  const activeTrainings = trainingsList.filter((t) => t.is_active).length;

  const { data: logs } = await sb
    .from("audit_logs")
    .select("id, user_id, action, entity, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const logUserIds = [...new Set((logs ?? []).map((l) => l.user_id))];
  const { data: logUsers } =
    logUserIds.length > 0
      ? await sb.from("users").select("id, name").in("id", logUserIds)
      : { data: [] as const };
  const nameById = new Map((logUsers ?? []).map((u) => [u.id, u.name]));

  const recentActivity = (logs ?? []).map((log) => {
    const meta = log.metadata as Record<string, string> | null;
    return {
      id: log.id,
      user: nameById.get(log.user_id) ?? "Usuario",
      action: log.action,
      training: meta?.trainingTitle ?? log.entity,
      time: formatShort(log.created_at),
    };
  });

  return {
    stats: {
      totalTrainings: trainingsList.length,
      activeTrainings,
      totalAssignments: totalA,
      activeEmployees: empCount ?? 0,
      completionRate:
        totalA > 0 ? Math.round((completedA / totalA) * 100) : 0,
      avgScore,
    },
    trainings,
    recentActivity,
  };
}

export type SupervisorTeam = {
  stats: {
    totalMembers: number;
    avgCompletion: number;
    topPerformer: string;
    atRisk: number;
  };
  members: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
    completedTrainings: number;
    totalTrainings: number;
    points: number;
  }>;
};

export async function getSupervisorTeam(
  supervisorId: string
): Promise<SupervisorTeam | null> {
  const sb = db();
  if (!sb) return null;

  const { data: members } = await sb
    .from("users")
    .select("id, name, position, department, points")
    .eq("supervisor_id", supervisorId)
    .eq("is_active", true);

  const list = members ?? [];
  if (list.length === 0) {
    return {
      stats: {
        totalMembers: 0,
        avgCompletion: 0,
        topPerformer: "—",
        atRisk: 0,
      },
      members: [],
    };
  }

  const { data: allAssign } = await sb
    .from("assignments")
    .select("user_id, status")
    .in(
      "user_id",
      list.map((m) => m.id)
    );

  const byUser = new Map<string, { total: number; completed: number }>();
  for (const a of allAssign ?? []) {
    const cur = byUser.get(a.user_id) ?? { total: 0, completed: 0 };
    cur.total += 1;
    if (a.status === "COMPLETED") cur.completed += 1;
    byUser.set(a.user_id, cur);
  }

  const enriched = list.map((m) => {
    const st = byUser.get(m.id) ?? { total: 0, completed: 0 };
    return {
      id: m.id,
      name: m.name,
      position: m.position ?? "—",
      department: m.department ?? "—",
      completedTrainings: st.completed,
      totalTrainings: st.total,
      points: m.points,
    };
  });

  let sum = 0;
  let atRisk = 0;
  let topName = "—";
  let topPoints = -1;
  for (const m of enriched) {
    const pct =
      m.totalTrainings > 0
        ? Math.round((m.completedTrainings / m.totalTrainings) * 100)
        : 0;
    sum += pct;
    if (pct < 50 && m.totalTrainings > 0) atRisk += 1;
    if (m.points > topPoints) {
      topPoints = m.points;
      topName = m.name;
    }
  }

  return {
    stats: {
      totalMembers: enriched.length,
      avgCompletion:
        enriched.length > 0 ? Math.round(sum / enriched.length) : 0,
      topPerformer: topName,
      atRisk,
    },
    members: enriched,
  };
}

export type AdminEmployeeRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string;
  points: number;
  completedTrainings: number;
  totalTrainings: number;
  isActive: boolean;
};

export async function getAdminEmployees(): Promise<AdminEmployeeRow[] | null> {
  const sb = db();
  if (!sb) return null;

  const { data: users } = await sb
    .from("users")
    .select("id, name, email, role, position, department, points, is_active")
    .order("name", { ascending: true });
  if (!users?.length) return [];

  const { data: assigns } = await sb.from("assignments").select("user_id, status");
  const byUser = new Map<string, { total: number; completed: number }>();
  for (const a of assigns ?? []) {
    const cur = byUser.get(a.user_id) ?? { total: 0, completed: 0 };
    cur.total += 1;
    if (a.status === "COMPLETED") cur.completed += 1;
    byUser.set(a.user_id, cur);
  }

  return users.map((u) => {
    const st = byUser.get(u.id) ?? { total: 0, completed: 0 };
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      position: u.position ?? "—",
      department: u.department ?? "—",
      points: u.points,
      completedTrainings: st.completed,
      totalTrainings: st.total,
      isActive: u.is_active,
    };
  });
}

export async function getTopbarUser(userId: string) {
  const sb = db();
  if (!sb) return null;
  const { data } = await sb
    .from("users")
    .select("name, email, points, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    name: data.name,
    email: data.email,
    points: data.points,
    avatar: data.avatar_url ?? undefined,
  };
}

export type EmployeeProfile = {
  user: {
    name: string;
    email: string;
    role: string;
    department: string;
    position: string;
    joinedAt: string;
    points: number;
    completedTrainings: number;
    totalTrainings: number;
    streak: number;
    rank: number;
  };
  activity: Array<{
    id: string;
    training: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    points: number;
    date: string;
  }>;
};

export async function getEmployeeProfile(
  userId: string
): Promise<EmployeeProfile | null> {
  const dash = await getEmployeeDashboard(userId);
  const sb = db();
  if (!dash || !sb) return null;

  const { data: u } = await sb
    .from("users")
    .select("name, email, role, department, position, created_at, points")
    .eq("id", userId)
    .maybeSingle();
  if (!u) return null;

  const { data: assigns } = await sb
    .from("assignments")
    .select("id, status, score, training_id, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(8);
  const rows = assigns ?? [];
  const tids = [...new Set(rows.map((r) => r.training_id))];
  const { data: tr } =
    tids.length > 0
      ? await sb.from("trainings").select("id, title").in("id", tids)
      : { data: [] as const };
  const tmap = new Map((tr ?? []).map((t) => [t.id, t.title]));

  const activity = rows.map((a) => ({
    id: a.id,
    training: tmap.get(a.training_id) ?? "Capacitación",
    status: a.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
    points: a.status === "COMPLETED" && a.score ? a.score * 3 : 0,
    date: formatShort(a.updated_at),
  }));

  const roleLabel =
    u.role === "ADMIN_HR"
      ? "Admin HR"
      : u.role === "SUPERVISOR"
        ? "Supervisor"
        : "Empleado";

  return {
    user: {
      name: u.name,
      email: u.email,
      role: roleLabel,
      department: u.department ?? "—",
      position: u.position ?? "—",
      joinedAt: formatShort(u.created_at),
      points: u.points,
      completedTrainings: dash.user.completedTrainings,
      totalTrainings: dash.user.totalTrainings,
      streak: dash.user.streak,
      rank: dash.user.rank,
    },
    activity,
  };
}

const CATEGORY_CHART_COLORS = [
  "#1E6FD9",
  "#F59E0B",
  "#8B5CF6",
  "#22C55E",
  "#EC4899",
  "#14B8A6",
  "#64748B",
];

const POINT_BUCKET_FILLS = [
  "var(--pending)",
  "var(--warning)",
  "var(--chart-1)",
  "var(--success)",
  "var(--chart-4)",
];

export type AdminAnalyticsSnapshot = {
  headline: {
    completionRate: number;
    participantsCount: number;
    activeTrainings: number;
    totalPointsSum: number;
  };
  completionByDepartment: Array<{ department: string; completion: number }>;
  monthlyEngagement: Array<{
    month: string;
    assigned: number;
    completed: number;
  }>;
  pointsDistribution: Array<{ range: string; count: number; fill: string }>;
  categoryBreakdown: Array<{ name: string; value: number; fill: string }>;
};

function monthStartKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function parseMonthKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return monthStartKey(d);
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsSnapshot | null> {
  const sb = db();
  if (!sb) return null;

  const { data: allAssign } = await sb
    .from("assignments")
    .select(
      "id, status, score, training_id, user_id, created_at, updated_at, completed_at"
    );
  const assigns = allAssign ?? [];

  const { data: trainingsRows } = await sb
    .from("trainings")
    .select("id, category, is_active");
  const trainings = trainingsRows ?? [];
  const activeTrainings = trainings.filter((t) => t.is_active).length;
  const catByTrainingId = new Map(trainings.map((t) => [t.id, t.category]));

  const totalA = assigns.length;
  const completedA = assigns.filter((a) => a.status === "COMPLETED").length;
  const completionRate =
    totalA > 0 ? Math.round((completedA / totalA) * 100) : 0;

  const participantIds = new Set(assigns.map((a) => a.user_id));
  const participantsCount = participantIds.size;

  const { data: usersPoints } = await sb
    .from("users")
    .select("points")
    .eq("is_active", true);
  const totalPointsSum = (usersPoints ?? []).reduce((s, u) => s + (u.points ?? 0), 0);

  const { data: emps } = await sb
    .from("users")
    .select("id, department")
    .eq("role", "EMPLOYEE")
    .eq("is_active", true);
  const deptByUser = new Map((emps ?? []).map((e) => [e.id, e.department ?? "Sin departamento"]));

  const deptStats = new Map<string, { total: number; completed: number }>();
  for (const a of assigns) {
    const dept = deptByUser.get(a.user_id) ?? "Sin departamento";
    const cur = deptStats.get(dept) ?? { total: 0, completed: 0 };
    cur.total += 1;
    if (a.status === "COMPLETED") cur.completed += 1;
    deptStats.set(dept, cur);
  }
  const completionByDepartment = [...deptStats.entries()]
    .map(([department, st]) => ({
      department,
      completion:
        st.total > 0 ? Math.round((st.completed / st.total) * 100) : 0,
    }))
    .sort((a, b) => a.department.localeCompare(b.department));

  const now = new Date();
  const monthKeys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(monthStartKey(d));
  }
  const monthLabel = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
  });
  const monthlyEngagement = monthKeys.map((key) => {
    const d = new Date(key);
    let assigned = 0;
    let completed = 0;
    for (const a of assigns) {
      if (parseMonthKey(a.created_at) === key) assigned += 1;
      if (a.status === "COMPLETED") {
        const ref = a.completed_at ?? a.updated_at;
        if (parseMonthKey(ref) === key) completed += 1;
      }
    }
    return {
      month: monthLabel.format(d),
      assigned,
      completed,
    };
  });

  const { data: empUsers } = await sb
    .from("users")
    .select("points")
    .eq("role", "EMPLOYEE")
    .eq("is_active", true);
  const buckets = [
    { range: "0-500", min: 0, max: 500 },
    { range: "501-1000", min: 501, max: 1000 },
    { range: "1001-2000", min: 1001, max: 2000 },
    { range: "2001-2999", min: 2001, max: 2999 },
    { range: "3000+", min: 3000, max: Infinity },
  ];
  const pointsDistribution = buckets.map((b, i) => {
    const count = (empUsers ?? []).filter(
      (u) => u.points >= b.min && u.points <= b.max
    ).length;
    return {
      range: b.range,
      count,
      fill: POINT_BUCKET_FILLS[i] ?? "var(--muted)",
    };
  });

  const catCount = new Map<string, number>();
  for (const a of assigns) {
    const cat = catByTrainingId.get(a.training_id) ?? "Otras";
    catCount.set(cat, (catCount.get(cat) ?? 0) + 1);
  }
  const catTotal = [...catCount.values()].reduce((s, n) => s + n, 0);
  let ci = 0;
  const categoryBreakdown = [...catCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value: catTotal > 0 ? Math.round((value / catTotal) * 100) : 0,
      fill: CATEGORY_CHART_COLORS[ci++ % CATEGORY_CHART_COLORS.length],
    }));

  return {
    headline: {
      completionRate,
      participantsCount,
      activeTrainings,
      totalPointsSum,
    },
    completionByDepartment,
    monthlyEngagement,
    pointsDistribution,
    categoryBreakdown,
  };
}
