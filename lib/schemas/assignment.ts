import { z } from "zod";

export const createTrainingAssignmentsBodySchema = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(500),
});

export type CreateTrainingAssignmentsBody = z.infer<
  typeof createTrainingAssignmentsBodySchema
>;
