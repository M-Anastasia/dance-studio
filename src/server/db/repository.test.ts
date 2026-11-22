import { isOverlaps, type TimeRange } from "@shared/lib/time-range";
import { describe, expect, it } from "vitest";
import { createInMemoryRepository } from "./repository";
import { createSeed, HALL_BIG_ID, HALL_SMALL_ID } from "./seed";

const ANCHOR = new Date("2026-12-07T00:00:00.000Z"); // понедельник

const newRepo = () => createInMemoryRepository(createSeed(ANCHOR));

const input = (
  hallId: string,
  start: string,
  end: string,
  maxStudents = 10,
) => ({ direction: "Test", teacher: "Тест", hallId, start, end, maxStudents });

describe("seed", () => {
  it("содержит два зала нужной вместимости", () => {
    const halls = newRepo().listHalls();
    expect(
      halls
        .map((hall) => hall.capacity)
        .sort((hallCapacityA, hallCapacityB) => hallCapacityA - hallCapacityB),
    ).toEqual([15, 30]);
  });

  it("не содержит пересечений внутри одного зала", () => {
    const seed = createSeed(ANCHOR);
    for (const hall of seed.halls) {
      const events: TimeRange[] = [
        ...seed.classes.filter((item) => item.hallId === hall.id),
        ...seed.hallBookings.filter((item) => item.hallId === hall.id),
      ];
      for (const [index, timeRangeA] of events.entries()) {
        for (const timeRangeB of events.slice(index + 1)) {
          expect(isOverlaps(timeRangeA, timeRangeB)).toBe(false);
        }
      }
    }
  });
});

describe("createClass", () => {
  it("создаёт занятие в свободном слоте", () => {
    const repo = newRepo();
    const result = repo.createClass(
      input(
        HALL_BIG_ID,
        "2026-12-08T10:00:00.000Z",
        "2026-12-08T11:00:00.000Z",
      ),
    );
    expect(result.ok).toBe(true);
  });

  it("отклоняет пересечение с занятием в том же зале", () => {
    const result = newRepo().createClass(
      input(
        HALL_BIG_ID,
        "2026-12-07T20:30:00.000Z",
        "2026-12-07T21:30:00.000Z",
      ),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("HALL_BUSY");
  });

  it("разрешает занятие вплотную после другого", () => {
    const result = newRepo().createClass(
      input(
        HALL_BIG_ID,
        "2026-12-07T21:00:00.000Z",
        "2026-12-07T22:00:00.000Z",
      ),
    );
    expect(result.ok).toBe(true);
  });

  it("разрешает то же время в другом зале", () => {
    const result = newRepo().createClass(
      input(
        HALL_SMALL_ID,
        "2026-12-07T20:30:00.000Z",
        "2026-12-07T21:30:00.000Z",
      ),
    );
    expect(result.ok).toBe(true);
  });

  it("учитывает бронь через полночь", () => {
    const repo = newRepo();
    const clash = repo.createClass(
      input(
        HALL_BIG_ID,
        "2026-12-12T00:30:00.000Z",
        "2026-12-12T01:30:00.000Z",
      ),
    );
    const adjacent = repo.createClass(
      input(
        HALL_BIG_ID,
        "2026-12-12T01:00:00.000Z",
        "2026-12-12T02:00:00.000Z",
      ),
    );
    expect(clash.ok).toBe(false);
    expect(adjacent.ok).toBe(true);
  });

  it("не даёт превысить вместимость малого зала", () => {
    const repo = newRepo();
    const tooMany = repo.createClass(
      input(
        HALL_SMALL_ID,
        "2026-12-08T10:00:00.000Z",
        "2026-12-08T11:00:00.000Z",
        16,
      ),
    );
    const exact = repo.createClass(
      input(
        HALL_SMALL_ID,
        "2026-12-08T10:00:00.000Z",
        "2026-12-08T11:00:00.000Z",
        15,
      ),
    );
    expect(tooMany.ok).toBe(false);
    if (!tooMany.ok) expect(tooMany.error.code).toBe("CAPACITY_EXCEEDED");
    expect(exact.ok).toBe(true);
  });

  it("возвращает ошибку для несуществующего зала", () => {
    const result = newRepo().createClass(
      input(
        "hall-unknown",
        "2026-12-08T10:00:00.000Z",
        "2026-12-08T11:00:00.000Z",
      ),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("HALL_NOT_FOUND");
  });
});

describe("isHallFree", () => {
  it("игнорирует отменённые брони", () => {
    const repo = createInMemoryRepository({
      halls: [{ id: "h1", name: "Зал", capacity: 10 }],
      classes: [],
      hallBookings: [
        {
          id: "b1",
          hallId: "h1",
          type: "self-practice",
          ownerId: "u1",
          participants: 1,
          start: "2026-12-07T10:00:00.000Z",
          end: "2026-12-07T11:00:00.000Z",
          status: "cancelled",
        },
      ],
    });
    expect(
      repo.isHallFree("h1", {
        start: "2026-12-07T10:00:00.000Z",
        end: "2026-12-07T11:00:00.000Z",
      }),
    ).toBe(true);
  });
});
