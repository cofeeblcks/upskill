import { z } from "zod";

export const createEmployeeBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  department: z.string().min(1),
  position: z.string().min(1),
  role: z.enum(["EMPLOYEE", "SUPERVISOR", "ADMIN_HR"]),
});

export type CreateEmployeeBody = z.infer<typeof createEmployeeBodySchema>;

export const updateEmployeeBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    department: z.string().min(1).optional(),
    position: z.string().min(1).optional(),
    role: z.enum(["EMPLOYEE", "SUPERVISOR", "ADMIN_HR"]).optional(),
    isActive: z.boolean().optional(),
    supervisorId: z.string().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Sin campos para actualizar",
  });

export type UpdateEmployeeBody = z.infer<typeof updateEmployeeBodySchema>;
