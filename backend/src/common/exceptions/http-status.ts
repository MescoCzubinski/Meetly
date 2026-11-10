import type { ExceptionKind } from "./domain.exception";

export const HTTP_STATUS: Record<
  ExceptionKind,
  { statusCode: number; error: string }
> = {
  invalid: { statusCode: 400, error: "Bad Request" },
  forbidden: { statusCode: 403, error: "Forbidden" },
  "not-found": { statusCode: 404, error: "Not Found" },
};
