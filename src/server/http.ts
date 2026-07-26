import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthorizationError } from "@/domain/rbac";
import { TimeBalanceError } from "@/domain/time-balance-service";
import { getServerEnvironment } from "@/server/env";

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type RequestContext = Readonly<{
  ipAddress: string | null;
  userAgent: string | null;
}>;

export function requestContext(request: Request): RequestContext {
  const forwarded = request.headers.get("x-forwarded-for");
  return {
    ipAddress:
      forwarded?.split(",")[0]?.trim().slice(0, 64) ??
      request.headers.get("x-real-ip")?.slice(0, 64) ??
      null,
    userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null,
  };
}

export function assertTrustedMutation(request: Request): void {
  const environment = getServerEnvironment();
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(environment.APP_URL).origin;
  const requestedWith = request.headers.get("x-requested-with");

  if (
    (origin && origin !== expectedOrigin) ||
    requestedWith !== "control-horas-pwa"
  ) {
    throw new AppError(
      "CSRF_VALIDATION_FAILED",
      "No se pudo validar el origen de la solicitud.",
      403,
    );
  }
}

export function success<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_form";
    fields[path] = [...(fields[path] ?? []), issue.message];
  }
  return fields;
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Revisa los datos ingresados.",
          fieldErrors: zodFieldErrors(error),
        },
      },
      { status: 422 },
    );
  }

  if (error instanceof AppError || error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...("fieldErrors" in error && error.fieldErrors
            ? { fieldErrors: error.fieldErrors }
            : {}),
        },
      },
      { status: error.status },
    );
  }

  if (error instanceof TimeBalanceError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: 409 },
    );
  }

  console.error("Error interno no expuesto al cliente.", {
    name: error instanceof Error ? error.name : "UnknownError",
  });
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocurrió un problema. Intenta nuevamente.",
      },
    },
    { status: 500 },
  );
}

export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError(
      "INVALID_JSON",
      "El contenido de la solicitud no es válido.",
      400,
    );
  }
}
