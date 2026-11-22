import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getClasses } from "../api/classes/route";
import { GET as getHallBookings } from "../api/hall-bookings/route";
import { GET as getHall } from "../api/halls/[id]/route";
import { GET as getHalls } from "../api/halls/route";
import { setRepository } from "../db";
import { createInMemoryRepository } from "../db/repository";
import { createSeed } from "../db/seed";
import { withErrorHandling } from "./http";

const ANCHOR = new Date("2026-12-07T00:00:00.000Z");

const request = (path: string) => new NextRequest(`http://localhost${path}`);

beforeEach(() => {
  setRepository(createInMemoryRepository(createSeed(ANCHOR)));
});

describe("GET /api/halls", () => {
  it("возвращает два зала", async () => {
    const response = await getHalls();
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(2);
  });
});

describe("GET /api/halls/[id]", () => {
  it("возвращает зал по идентификатору", async () => {
    const response = await getHall(request("/api/halls/hall-big"), {
      params: Promise.resolve({ id: "hall-big" }),
    });
    expect(response.status).toBe(200);
    expect((await response.json()).capacity).toBe(30);
  });

  it("404, если зала нет", async () => {
    const response = await getHall(request("/api/halls/nope"), {
      params: Promise.resolve({ id: "nope" }),
    });
    expect(response.status).toBe(404);
    expect((await response.json()).error.code).toBe("NOT_FOUND");
  });
});

describe("GET /api/classes", () => {
  it("возвращает все занятия без фильтров", async () => {
    const response = await getClasses(request("/api/classes"));
    expect(await response.json()).toHaveLength(24); // 6 занятий × 4 недели
  });

  it("фильтрует по интервалу", async () => {
    const response = await getClasses(
      request(
        "/api/classes?from=2026-12-07T00:00:00.000Z&to=2026-12-08T00:00:00.000Z",
      ),
    );
    const body = await response.json();
    expect(body).toHaveLength(1);
    expect(body[0].direction).toBe("Contemporary");
  });

  it("фильтрует по залу", async () => {
    const response = await getClasses(
      request("/api/classes?hallId=hall-small"),
    );
    const body = await response.json();
    expect(body).toHaveLength(8); // 2 занятия × 4 недели
  });

  it('отклоняет "от" без "до"', async () => {
    const response = await getClasses(
      request("/api/classes?from=2026-12-07T00:00:00.000Z"),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details[0].path).toBe("from");
  });

  it('отклоняет интервал, где "до" раньше "от" ', async () => {
    const response = await getClasses(
      request(
        "/api/classes?from=2026-12-08T00:00:00.000Z&to=2026-12-07T00:00:00.000Z",
      ),
    );
    expect(response.status).toBe(400);
  });

  it("отклоняет дату не в формате UTC", async () => {
    const response = await getClasses(
      request("/api/classes?from=2026-12-07&to=2026-12-08"),
    );
    expect(response.status).toBe(400);
  });
});

describe("GET /api/hall-bookings", () => {
  it("возвращает все брони сида", async () => {
    const response = await getHallBookings(request("/api/hall-bookings"));
    expect(await response.json()).toHaveLength(3);
  });

  it("находит бронь через полночь по интервалу ночи", async () => {
    const response = await getHallBookings(
      request(
        "/api/hall-bookings?from=2026-12-12T00:00:00.000Z&to=2026-12-12T00:30:00.000Z",
      ),
    );
    const body = await response.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("booking-1");
  });
});

describe("withErrorHandling", () => {
  it("превращает неожиданную ошибку в 500 без деталей", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withErrorHandling(async () => {
      throw new Error("секретная подробность");
    });
    const response = await handler();
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(body)).not.toContain("секретная");
    spy.mockRestore();
  });
});
