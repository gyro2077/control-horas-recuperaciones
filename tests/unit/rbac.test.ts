import { describe, expect, it } from "vitest";

import { AuthorizationError, RbacService } from "@/domain/rbac";

describe("RbacService", () => {
  it("un usuario normal puede consultar sus propios datos", () => {
    expect(
      RbacService.canAccessUser({ id: "usuario-a", role: "USER" }, "usuario-a"),
    ).toBe(true);
  });

  it("un usuario normal no puede consultar registros ajenos", () => {
    expect(() =>
      RbacService.assertUserAccess(
        { id: "usuario-a", role: "USER" },
        "usuario-b",
      ),
    ).toThrowError(AuthorizationError);
  });

  it("un administrador puede consultar cualquier usuario", () => {
    expect(
      RbacService.canAccessUser({ id: "admin", role: "ADMIN" }, "usuario-a"),
    ).toBe(true);
  });
});
