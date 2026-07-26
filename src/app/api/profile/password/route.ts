import { z } from "zod";

import { requireSession } from "@/server/auth/session";
import {
  assertTrustedMutation,
  errorResponse,
  parseJson,
  success,
} from "@/server/http";
import { changeOwnPassword } from "@/server/services/user-service";

const strongPassword = z
  .string()
  .min(12, "Utiliza al menos 12 caracteres.")
  .max(200)
  .regex(/[A-Z]/, "Incluye una letra mayúscula.")
  .regex(/[a-z]/, "Incluye una letra minúscula.")
  .regex(/\d/, "Incluye un número.");

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Ingresa tu contraseña actual.")
      .max(200),
    newPassword: strongPassword,
    confirmPassword: z.string().max(200),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export async function PATCH(request: Request) {
  try {
    assertTrustedMutation(request);
    const session = await requireSession();
    const input = passwordSchema.parse(await parseJson(request));
    await changeOwnPassword(session, input.currentPassword, input.newPassword);
    return success({ changed: true });
  } catch (error) {
    return errorResponse(error);
  }
}
