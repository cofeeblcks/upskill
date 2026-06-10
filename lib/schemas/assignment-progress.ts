import { z } from "zod";

export const assignmentProgressBodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }),
  z.object({
    action: z.literal("progress"),
    progress: z.number().int().min(0).max(100),
  }),
  z.object({
    action: z.literal("complete"),
    score: z.number().int().min(0).max(100).optional(),
  }),
]);

export type AssignmentProgressBody = z.infer<
  typeof assignmentProgressBodySchema
>;
