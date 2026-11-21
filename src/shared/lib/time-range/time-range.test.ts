import { describe, expect, it } from "vitest";
import { isOverlaps, type TimeRange } from "./time-range";

const getRange = (start: string, end: string): TimeRange => ({ start, end });

describe("isOverlaps", () => {
  it("находит частичное пересечение", () => {
    const timeRangeA = getRange(
      "2026-12-07T20:00:00.000Z",
      "2026-12-07T21:00:00.000Z",
    );
    const timeRangeB = getRange(
      "2026-12-07T20:30:00.000Z",
      "2026-12-07T21:30:00.000Z",
    );
    expect(isOverlaps(timeRangeA, timeRangeB)).toBe(true);
  });

  it("не считает пересечением смежные интервалы", () => {
    const timeRangeA = getRange(
      "2026-12-07T20:00:00.000Z",
      "2026-12-07T21:00:00.000Z",
    );
    const timeRangeB = getRange(
      "2026-12-07T21:00:00.000Z",
      "2026-12-07T22:00:00.000Z",
    );
    expect(isOverlaps(timeRangeA, timeRangeB)).toBe(false);
  });

  it("находит вложенный интервал", () => {
    const outerRange = getRange(
      "2026-12-07T10:00:00.000Z",
      "2026-12-07T14:00:00.000Z",
    );
    const innerRange = getRange(
      "2026-12-07T11:00:00.000Z",
      "2026-12-07T12:00:00.000Z",
    );
    expect(isOverlaps(outerRange, innerRange)).toBe(true);
  });

  it("симметрична", () => {
    const timeRangeA = getRange(
      "2026-12-07T20:00:00.000Z",
      "2026-12-07T21:00:00.000Z",
    );
    const timeRangeB = getRange(
      "2026-12-07T20:30:00.000Z",
      "2026-12-07T21:30:00.000Z",
    );
    expect(isOverlaps(timeRangeA, timeRangeB)).toBe(
      isOverlaps(timeRangeB, timeRangeA),
    );
  });

  it("работает через полночь", () => {
    const nightRange = getRange(
      "2026-12-11T23:00:00.000Z",
      "2026-12-12T01:00:00.000Z",
    );
    const timeRangeA = getRange(
      "2026-12-12T00:30:00.000Z",
      "2026-12-12T00:45:00.000Z",
    );
    const timeRangeB = getRange(
      "2026-12-12T01:00:00.000Z",
      "2026-12-12T02:00:00.000Z",
    );
    expect(isOverlaps(nightRange, timeRangeA)).toBe(true);
    expect(isOverlaps(nightRange, timeRangeB)).toBe(false);
  });
});
