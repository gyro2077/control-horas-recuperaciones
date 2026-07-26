import { z } from "zod";

import type { IsoDate } from "@/domain/time-balance-service";
import { requireSession } from "@/server/auth/session";
import { createReportExcel } from "@/server/export/excel";
import { buildReportData } from "@/server/export/report-data";
import { errorResponse } from "@/server/http";

const querySchema = z.object({
  userId: z.uuid().optional(),
  from: z.iso.date(),
  to: z.iso.date(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const input = querySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const report = await buildReportData(
      session.user,
      input.userId ?? session.user.id,
      input.from as IsoDate,
      input.to as IsoDate,
    );
    const buffer = await createReportExcel(report);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="reporte-horas-${input.from}-${input.to}.xlsx"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
