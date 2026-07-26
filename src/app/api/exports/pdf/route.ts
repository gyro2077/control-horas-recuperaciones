import { z } from "zod";

import type { IsoDate } from "@/domain/time-balance-service";
import { requireSession } from "@/server/auth/session";
import { createReportPdf } from "@/server/export/pdf";
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
    const bytes = await createReportPdf(report);
    return new Response(bytes as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-horas-${input.from}-${input.to}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
