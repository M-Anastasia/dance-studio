import type { NextRequest } from "next/server";
import { getRepository } from "../../db";
import { jsonOk, parseQuery, withErrorHandling } from "../http";
import { ListQuerySchema, toTimeRange } from "../queries";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const query = parseQuery(ListQuerySchema, request.nextUrl.searchParams);
  if (!query.ok) return query.response;

  const { hallId } = query.data;
  const classes = getRepository()
    .listOfClasses(toTimeRange(query.data))
    .filter((item) => !hallId || item.hallId === hallId);

  return jsonOk(classes);
});
