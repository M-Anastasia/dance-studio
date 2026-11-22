import { NextResponse } from "next/server";
import type { z } from "zod";
import type { DomainError, DomainErrorCode } from "../db/result";

export type ApiErrorCode =
  | DomainErrorCode
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export type ApiErrorBody = {
  error: { code: ApiErrorCode; message: string; details?: unknown };
};

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  HALL_NOT_FOUND: 422,
  HALL_BUSY: 409,
  CAPACITY_EXCEEDED: 422,
  INTERNAL_ERROR: 500,
};
export const jsonOk = <T>(data: T, status = 200): NextResponse<T> =>
  NextResponse.json(data, { status });

export const jsonError = (
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): NextResponse<ApiErrorBody> =>
  NextResponse.json(
    { error: { code, message, details } },
    { status: STATUS_BY_CODE[code] },
  );

export const domainErrorResponse = (
  error: DomainError,
): NextResponse<ApiErrorBody> => jsonError(error.code, error.message);

export const parseQuery = <S extends z.ZodType>(
  schema: S,
  searchParams: URLSearchParams,
) => {
  const parsed = schema.safeParse(Object.fromEntries(searchParams));
  if (parsed.success) {
    return { ok: true as const, data: parsed.data };
  }
  return {
    ok: false as const,
    response: jsonError(
      "VALIDATION_ERROR",
      "Некорректные параметры запроса",
      parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    ),
  };
};

export const handle =
  <Args extends unknown[]>(
    fn: (...args: Args) => Promise<Response> | Response,
  ): ((...args: Args) => Promise<Response>) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(error);
      return jsonError("INTERNAL_ERROR", "Внутренняя ошибка сервера");
    }
  };
