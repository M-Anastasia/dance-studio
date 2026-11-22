import { jsonOk, withErrorHandling } from "@server/api/http";
import { getRepository } from "@server/db";

export const GET = withErrorHandling(async () =>
  jsonOk(getRepository().listHalls()),
);
