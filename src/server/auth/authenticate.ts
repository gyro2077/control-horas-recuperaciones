import "server-only";

import { createHmac } from "node:crypto";

import { database } from "@/server/database";
import { getServerEnvironment } from "@/server/env";
import { AppError, type RequestContext } from "@/server/http";
import { verifyPassword } from "@/server/auth/password";

const DUMMY_PASSWORD_HASH =
  "$2b$12$LQv3c1yqBW/BRiPEeGa0XO0s5r9uSRQnVhZPA1uZ8P0kIVQw.vqjK";

function throttleKey(email: string, context: RequestContext) {
  const environment = getServerEnvironment();
  return createHmac("sha256", environment.AUTH_SECRET)
    .update(`${context.ipAddress ?? "unknown"}|${email}`)
    .digest("hex");
}

export async function authenticateUser(
  rawEmail: string,
  password: string,
  context: RequestContext,
) {
  const environment = getServerEnvironment();
  const email = rawEmail.trim().toLowerCase();
  const keyHash = throttleKey(email, context);
  const now = new Date();
  const throttle = await database.authThrottle.findUnique({
    where: { keyHash },
  });

  if (throttle?.blockedUntil && throttle.blockedUntil > now) {
    throw new AppError(
      "AUTH_RATE_LIMITED",
      "Hay demasiados intentos. Espera unos minutos e inténtalo otra vez.",
      429,
    );
  }

  const user = await database.user.findUnique({ where: { email } });
  if (user?.lockedUntil && user.lockedUntil > now) {
    throw new AppError(
      "AUTH_ACCOUNT_LOCKED",
      "La cuenta está bloqueada temporalmente.",
      423,
    );
  }

  const validPassword = await verifyPassword(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );
  const validUser =
    user && user.status === "ACTIVE" && validPassword ? user : null;

  if (!validUser) {
    const windowExpired =
      !throttle ||
      now.getTime() - throttle.windowStartedAt.getTime() >
        environment.LOGIN_LOCK_MINUTES * 60_000;
    const failures = windowExpired ? 1 : (throttle?.failures ?? 0) + 1;
    const blockedUntil =
      failures >= environment.LOGIN_MAX_ATTEMPTS
        ? new Date(now.getTime() + environment.LOGIN_LOCK_MINUTES * 60_000)
        : null;

    await database.$transaction([
      database.authThrottle.upsert({
        where: { keyHash },
        update: {
          failures,
          blockedUntil,
          ...(windowExpired ? { windowStartedAt: now } : {}),
        },
        create: {
          keyHash,
          failures,
          windowStartedAt: now,
          blockedUntil,
        },
      }),
      ...(user
        ? [
            database.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: { increment: 1 },
                ...(blockedUntil ? { lockedUntil: blockedUntil } : {}),
              },
            }),
          ]
        : []),
    ]);

    throw new AppError(
      "AUTH_INVALID_CREDENTIALS",
      "El correo o la contraseña no son correctos.",
      401,
    );
  }

  await database.$transaction([
    database.authThrottle.deleteMany({ where: { keyHash } }),
    database.user.update({
      where: { id: validUser.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: now,
      },
    }),
  ]);

  return validUser;
}
