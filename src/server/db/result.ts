export type DomainErrorCode =
  | "HALL_NOT_FOUND"
  | "HALL_BUSY"
  | "CAPACITY_EXCEEDED";

export type DomainError = { code: DomainErrorCode; message: string };

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: DomainError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const err = (code: DomainErrorCode, message: string): Result<never> => ({
  ok: false,
  error: { code, message },
});
