import { z } from "zod";

import { authenticateUser } from "@/server/auth/authenticate";
import { createSession } from "@/server/auth/session";
import {
  assertTrustedMutation,
  errorResponse,
  parseJson,
  requestContext,
  success,
} from "@/server/http";

const loginSchema = z.object({
  email: z.email("Ingresa un correo válido."),
  password: z.string().min(8, "La contraseña es obligatoria.").max(200),
  remember: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const input = loginSchema.parse(await parseJson(request));
    const context = requestContext(request);
    const user = await authenticateUser(input.email, input.password, context);
    const expiresAt = await createSession(user.id, input.remember, context);

    return success({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        timezone: user.timezone,
      },
      expiresAt,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
