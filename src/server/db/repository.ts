import type { GroupClass, NewGroupClass } from "@entities/group-class";
import type { Hall } from "@entities/hall";
import type { HallBooking } from "@entities/hall-booking";
import { isOverlaps, type TimeRange } from "@shared/lib/time-range";
import { err, ok, type Result } from "./result";
import type { SeedData } from "./seed";

export type Repository = {
  listHalls: () => Hall[];
  getHall: (id: string) => Hall | undefined;
  listOfClasses: (range?: TimeRange) => GroupClass[];
  listOfHallBookings: (range?: TimeRange) => HallBooking[];
  isHallFree: (hallId: string, range: TimeRange, ignoreId?: string) => boolean;
  createClass: (input: NewGroupClass) => Result<GroupClass>;
};

const byStart = (timeRangeA: TimeRange, timeRangeB: TimeRange): number =>
  Date.parse(timeRangeA.start) - Date.parse(timeRangeB.start);

export const createInMemoryRepository = (initial: SeedData): Repository => {
  const halls = [...initial.halls];
  const classes = [...initial.classes];
  const hallBookings = [...initial.hallBookings];
  let sequence = 0;

  const nextId = (prefix: string): string => `${prefix}-${++sequence}`;

  const isHallFree = (
    hallId: string,
    range: TimeRange,
    ignoreId?: string,
  ): boolean => {
    const busyByClass = classes.some(
      (item) =>
        item.hallId === hallId &&
        item.id !== ignoreId &&
        isOverlaps(item, range),
    );
    const busyByBooking = hallBookings.some(
      (item) =>
        item.hallId === hallId &&
        item.status === "confirmed" &&
        item.id !== ignoreId &&
        isOverlaps(item, range),
    );
    return !busyByClass && !busyByBooking;
  };

  return {
    listHalls: () => [...halls],
    getHall: (id) => halls.find((hall) => hall.id === id),
    listOfClasses: (range) =>
      classes.filter((item) => !range || isOverlaps(item, range)).sort(byStart),
    listOfHallBookings: (range) =>
      hallBookings
        .filter((item) => !range || isOverlaps(item, range))
        .sort(byStart),
    isHallFree,

    createClass(input) {
      const hall = halls.find((item) => item.id === input.hallId);
      if (!hall) {
        return err("HALL_NOT_FOUND", `Зал ${input.hallId} не найден`);
      }
      if (input.maxStudents > hall.capacity) {
        return err(
          "CAPACITY_EXCEEDED",
          `В зале «${hall.name}» максимум ${hall.capacity} учеников`,
        );
      }
      if (!isHallFree(input.hallId, input)) {
        return err("HALL_BUSY", `Зал «${hall.name}» занят в это время`);
      }
      const created: GroupClass = { ...input, id: nextId("class") };
      classes.push(created);
      return ok(created);
    },
  };
};
