import { z } from "zod";

import { RbacService } from "@/domain/rbac";
import { TimeBalanceService } from "@/domain/time-balance-service";
import { requireSession } from "@/server/auth/session";
import { database } from "@/server/database";
import {
  AppError,
  assertTrustedMutation,
  errorResponse,
  parseJson,
  success,
} from "@/server/http";

const schema = z.object({
  workedMinutes: z.number().int().min(0).max(1_440),
  reason: z.string().trim().min(3).max(300),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertTrustedMutation(request);
    const session = await requireSession();
    RbacService.assertAdmin(session.user);
    const id = z.uuid().parse((await params).id);
    const input = schema.parse(await parseJson(request));
    const current = await database.dailyEntry.findUnique({ where: { id } });
    if (!current) {
      throw new AppError("ENTRY_NOT_FOUND", "Registro no encontrado.", 404);
    }
    const calculation = TimeBalanceService.calculateDay(
      current.scheduledMinutes,
      input.workedMinutes,
    );
    const correctionNote = `Corrección administrativa: ${input.reason}`;
    const note = [current.note, correctionNote].filter(Boolean).join(" · ");
    const entry = await database.dailyEntry.update({
      where: { id },
      data: {
        workedMinutes: input.workedMinutes,
        balanceMinutes: calculation.balanceMinutes,
        startDateTime: null,
        endDateTime: null,
        breakMinutes: 0,
        note: note.slice(0, 1_000),
      },
      include: { permission: true },
    });

    return success({ entry });
  } catch (error) {
    return errorResponse(error);
  }
}
