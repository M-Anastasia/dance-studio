import { z } from "zod";

export const IsoDateTimeSchema = z.iso.datetime();

export type TimeRange = { start: string; end: string };

const isoToTimestamp = (iso: string): number => Date.parse(iso);

export const isValidRange = (timeRange: TimeRange): boolean => {
  return isoToTimestamp(timeRange.end) > isoToTimestamp(timeRange.start);
};

/** Интервалы полуоткрытые [start, end): смежные интервалы не пересекаются. */
export const isOverlaps = (
  timeRangeA: TimeRange,
  timeRangeB: TimeRange,
): boolean => {
  return (
    isoToTimestamp(timeRangeA.start) < isoToTimestamp(timeRangeB.end) &&
    isoToTimestamp(timeRangeB.start) < isoToTimestamp(timeRangeA.end)
  );
};
