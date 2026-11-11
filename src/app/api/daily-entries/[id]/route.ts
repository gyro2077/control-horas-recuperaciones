import { z } from "zod";

import { RbacService } from "@/domain/rbac";
import { requireSession } from "@/server/auth/session";
import {
  assertTrustedMutation,
  errorResponse,
  parseJson,
  success,
} from "@/server/http";
import { correctDailyEntry } from "@/server/services/daily-entry-service";

const schema = z.object({
  workedMinutes: z.number().int().min(0).max(1_440),
  reason: z.string().trim().min(3).max(300),
  version: z.iso.datetime({ offset: true }),
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
    const entry = await correctDailyEntry(session.user, id, input);

    return success({ entry });
  } catch (error) {
    return errorResponse(error);
  }
}
