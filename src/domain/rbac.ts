export type AppRole = "ADMIN" | "USER";

export type Principal = Readonly<{
  id: string;
  role: AppRole;
}>;

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN";
  readonly status = 403;

  constructor() {
    super("No tienes permiso para realizar esta acción.");
    this.name = "AuthorizationError";
  }
}

export const RbacService = {
  isAdmin(principal: Principal): boolean {
    return principal.role === "ADMIN";
  },

  canAccessUser(principal: Principal, userId: string): boolean {
    return principal.role === "ADMIN" || principal.id === userId;
  },

  assertAdmin(principal: Principal): void {
    if (!this.isAdmin(principal)) throw new AuthorizationError();
  },

  assertUserAccess(principal: Principal, userId: string): void {
    if (!this.canAccessUser(principal, userId)) {
      throw new AuthorizationError();
    }
  },
} as const;
