import { describe, expect, it } from "vitest";
import { NewGroupClassSchema } from "./schema";

const valid = {
  direction: "Contemporary",
  teacher: "Анна",
  hallId: "hall-big",
  start: "2026-12-07T20:00:00.000Z",
  end: "2026-12-07T21:00:00.000Z",
  maxStudents: 20,
};

describe("NewGroupClassSchema", () => {
  it("принимает корректные данные", () => {
    expect(NewGroupClassSchema.safeParse(valid).success).toBe(true);
  });

  it("отклоняет окончание раньше начала", () => {
    const result = NewGroupClassSchema.safeParse({
      ...valid,
      end: "2026-12-07T19:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("отклоняет время не в UTC", () => {
    const result = NewGroupClassSchema.safeParse({
      ...valid,
      start: "2026-12-07T21:00:00+01:00",
    });
    expect(result.success).toBe(false);
  });
});
