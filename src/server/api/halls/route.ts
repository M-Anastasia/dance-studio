import { getRepository } from "../../db";
import { jsonOk, withErrorHandling } from "../http";

export const GET = withErrorHandling(async () =>
  jsonOk(getRepository().listHalls()),
);
