import { IsoDateTimeSchema, isValidRange } from "@shared/lib/time-range";
import { z } from "zod";

const groupClassBase = z.object({
  id: z.string().min(1),
  direction: z.string().min(1),
  teacher: z.string().min(1),
  hallId: z.string().min(1),
  start: IsoDateTimeSchema,
  end: IsoDateTimeSchema,
  maxStudents: z.int().positive(),
});

const endAfterStart = {
  error: "Окончание должно быть позже начала",
  path: ["end"],
};

export const GroupClassSchema = groupClassBase.refine(
  isValidRange,
  endAfterStart,
);

export const NewGroupClassSchema = groupClassBase
  .omit({ id: true })
  .refine(isValidRange, endAfterStart);

export type GroupClass = z.infer<typeof GroupClassSchema>;
export type NewGroupClass = z.infer<typeof NewGroupClassSchema>;
