import type { NextRequest } from "next/server";
import { getRepository } from "../../../db";
import { jsonError, jsonOk, withErrorHandling } from "../../http";

export const GET = withErrorHandling(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await params;
    const hall = getRepository().getHall(id);
    return hall ? jsonOk(hall) : jsonError("NOT_FOUND", `Зал ${id} не найден`);
  },
);
