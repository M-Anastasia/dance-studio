import { z } from "zod";

export const HallSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  capacity: z.int().positive(),
});

export type Hall = z.infer<typeof HallSchema>;
