import { z } from "zod";

const appRole = z.enum(["EMPLOYEE", "SUPERVISOR", "ADMIN_HR"]);

/** Body shape from admin UI / API clients when creating a training */
export const createTrainingBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.string().min(1),
  /** Minutes (form sends string or number) */
  duration: z.coerce.number().int().positive(),
  durationMin: z.coerce.number().int().positive().optional(),
  fileUrl: z.string().optional().nullable(),
  requiredRoles: z.array(appRole).min(1),
  positions: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  assignUserIds: z.array(z.string().min(1)).max(500).optional().default([]),
});

export type CreateTrainingBody = z.infer<typeof createTrainingBodySchema>;

export const previewEligibleBodySchema = z.object({
  requiredRoles: z.array(appRole).min(1),
  positions: z.array(z.string()).default([]),
});

export const updateTrainingBodySchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    category: z.string().min(1).optional(),
    duration: z.coerce.number().int().positive().optional(),
    durationMin: z.coerce.number().int().positive().optional(),
    fileUrl: z.string().optional().nullable(),
    requiredRoles: z.array(appRole).min(1).optional(),
    positions: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "Sin campos para actualizar" });

export type UpdateTrainingBody = z.infer<typeof updateTrainingBodySchema>;
