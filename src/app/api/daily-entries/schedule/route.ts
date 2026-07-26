import { z } from "zod";

import type { IsoDate } from "@/domain/time-balance-service";
import { requireSession } from "@/server/auth/session";
import { errorResponse, success } from "@/server/http";
import { getScheduleForDate } from "@/server/services/daily-entry-service";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const date = z.iso
      .date()
      .parse(new URL(request.url).searchParams.get("date"));
    const schedule = await getScheduleForDate(session.user.id, date as IsoDate);
    return success({
      schedule: schedule.view,
      existingEntry: schedule.existingEntry,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
