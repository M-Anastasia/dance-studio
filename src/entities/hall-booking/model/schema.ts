import { IsoDateTimeSchema, isValidRange } from "@shared/lib/time-range";
import { z } from "zod";

export const HallBookingTypeSchema = z.enum([
  "self-practice",
  "individual",
  "masterclass",
  "group-rental",
]);

export const HallBookingStatusSchema = z.enum(["confirmed", "cancelled"]);

const hallBookingBase = z.object({
  id: z.string().min(1),
  hallId: z.string().min(1),
  type: HallBookingTypeSchema,
  ownerId: z.string().min(1),
  participants: z.int().positive(),
  start: IsoDateTimeSchema,
  end: IsoDateTimeSchema,
  status: HallBookingStatusSchema,
});

const endAfterStart = {
  error: "Окончание должно быть позже начала",
  path: ["end"],
};

export const HallBookingSchema = hallBookingBase.refine(
  isValidRange,
  endAfterStart,
);

export const NewHallBookingSchema = hallBookingBase
  .omit({ id: true, status: true })
  .refine(isValidRange, endAfterStart);

export type HallBookingType = z.infer<typeof HallBookingTypeSchema>;
export type HallBooking = z.infer<typeof HallBookingSchema>;
export type NewHallBooking = z.infer<typeof NewHallBookingSchema>;
