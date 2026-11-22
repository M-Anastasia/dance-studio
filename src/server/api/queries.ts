import { IsoDateTimeSchema, type TimeRange } from "@shared/lib/time-range";
import { z } from "zod";

export const ListQuerySchema = z
  .object({
    from: IsoDateTimeSchema.optional(),
    to: IsoDateTimeSchema.optional(),
    hallId: z.string().min(1).optional(),
  })
  .refine((query) => Boolean(query.from) === Boolean(query.to), {
    error: 'Параметры "от" и "до" задаются вместе',
    path: ["from"],
  })
  .refine(
    (query) =>
      !query.from || !query.to || Date.parse(query.to) > Date.parse(query.from),
    { error: '"До" должен быть позже "от"', path: ["to"] },
  );

export type ListQuery = z.infer<typeof ListQuerySchema>;

export const toTimeRange = (query: ListQuery): TimeRange | undefined =>
  query.from && query.to ? { start: query.from, end: query.to } : undefined;
