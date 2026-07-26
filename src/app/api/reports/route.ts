import { DateTime } from "luxon";
import { z } from "zod";

import type { IsoDate } from "@/domain/time-balance-service";
import { requireSession } from "@/server/auth/session";
import { buildReportData } from "@/server/export/report-data";
import { errorResponse, success } from "@/server/http";

const querySchema = z.object({
  userId: z.uuid().optional(),
  from: z.iso.date(),
  to: z.iso.date(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const query = querySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const report = await buildReportData(
      session.user,
      query.userId ?? session.user.id,
      query.from as IsoDate,
      query.to as IsoDate,
    );
    return success({ report });
  } catch (error) {
    return errorResponse(error);
  }
}

export function defaultReportPeriod(timezone: string) {
  const now = DateTime.now().setZone(timezone);
  return {
    from: now.startOf("month").toISODate(),
    to: now.endOf("month").toISODate(),
  };
}
