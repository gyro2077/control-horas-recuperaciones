import { z } from "zod";

import { RbacService } from "@/domain/rbac";
import { Role, UserStatus } from "@/generated/prisma/client";
import { requireSession } from "@/server/auth/session";
import {
  assertTrustedMutation,
  errorResponse,
  parseJson,
  success,
} from "@/server/http";
import {
  adminDeleteUser,
  adminUpdateUser,
} from "@/server/services/user-service";

const schema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  email: z
    .email()
    .transform((value) => value.trim().toLowerCase())
    .optional(),
  role: z.enum(Role).optional(),
  status: z.enum(UserStatus).optional(),
  scheduleId: z.uuid().nullable().optional(),
  password: z
    .string()
    .min(12)
    .max(200)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/)
    .optional(),
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
    const user = await adminUpdateUser(session.user, id, input);
    return success({ user });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertTrustedMutation(request);
    const session = await requireSession();
    RbacService.assertAdmin(session.user);
    const id = z.uuid().parse((await params).id);
    const deleted = await adminDeleteUser(session.user, id);
    return success({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
