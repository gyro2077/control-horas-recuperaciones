import "server-only";

import { createHmac, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { cache } from "react";

import type { Role } from "@/generated/prisma/client";
import { database } from "@/server/database";
import { getServerEnvironment } from "@/server/env";
import { AppError, type RequestContext } from "@/server/http";

export const SESSION_COOKIE = "chr_session";

export type AuthenticatedUser = Readonly<{
  id: string;
  name: string;
  email: string;
  role: Role;
  timezone: string;
}>;

export type CurrentSession = Readonly<{
  id: string;
  expiresAt: Date;
  user: AuthenticatedUser;
}>;

export function hashOpaqueToken(value: string): string {
  return createHmac("sha256", getServerEnvironment().AUTH_SECRET)
    .update(value)
    .digest("hex");
}

export async function createSession(
  userId: string,
  remember: boolean,
  context: RequestContext,
) {
  const environment = getServerEnvironment();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() +
      (remember
        ? environment.REMEMBER_SESSION_TTL_DAYS * 86_400_000
        : environment.SESSION_TTL_HOURS * 3_600_000),
  );

  await database.session.create({
    data: {
      userId,
      tokenHash: hashOpaqueToken(token),
      expiresAt,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });

  return expiresAt;
}

const getCurrentSessionUncached = async (): Promise<CurrentSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await database.session.findUnique({
    where: { tokenHash: hashOpaqueToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          timezone: true,
        },
      },
    },
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    session.user.status !== "ACTIVE"
  ) {
    return null;
  }

  return {
    id: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      timezone: session.user.timezone,
    },
  };
};

// Protected layouts and pages request the same session during one render.
// React's request cache prevents duplicate database queries for that render.
export const getCurrentSession = cache(getCurrentSessionUncached);

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) {
    throw new AppError("UNAUTHENTICATED", "Inicia sesión para continuar.", 401);
  }
  return session;
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await database.session.deleteMany({
      where: { tokenHash: hashOpaqueToken(token) },
    });
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
