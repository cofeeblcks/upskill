import { z } from "zod";

const roleCode = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[A-Z][A-Z0-9_]*$/, "Usa MAYÚSCULAS y guiones bajos (ej. COORDINADOR_AREA)");

export const createSettingsRoleSchema = z.object({
  code: roleCode,
  description: z.string().max(500).optional().default(""),
});

export const updateSettingsRoleSchema = z.object({
  code: roleCode.optional(),
  description: z.string().max(500).optional(),
  sort_order: z.number().int().optional(),
});

const colorVariant = z.enum([
  "primary",
  "secondary",
  "destructive",
  "success",
  "warning",
  "info",
]);

export const createTrainingCategorySchema = z.object({
  name: z.string().min(1).max(120),
  color_variant: colorVariant.default("primary"),
  sort_order: z.number().int().optional().default(0),
});

export const updateTrainingCategorySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  color_variant: colorVariant.optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});
