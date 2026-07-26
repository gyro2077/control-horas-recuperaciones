import { z } from "zod";

import { requireSession } from "@/server/auth/session";
import {
  assertTrustedMutation,
  errorResponse,
  parseJson,
  success,
} from "@/server/http";
import { updateOwnProfile } from "@/server/services/user-service";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre.").max(150),
  email: z
    .email("Ingresa un correo válido.")
    .transform((value) => value.trim().toLowerCase()),
});

export async function PATCH(request: Request) {
  try {
    assertTrustedMutation(request);
    const session = await requireSession();
    const input = profileSchema.parse(await parseJson(request));
    const user = await updateOwnProfile(session.user, input);
    return success({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
