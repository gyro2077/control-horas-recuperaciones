import { afterAll, beforeAll, describe, expect, it } from "vitest";

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const suite = enabled ? describe.sequential : describe.skip;

suite("flujos integrados del MVP con PostgreSQL", () => {
  let database: (typeof import("@/server/database"))["database"];
  let ids: {
    admin: string;
    user: string;
    schedule: string;
  };
  const marker = `integration-${Date.now()}`;
  const password = "Integration-2026!";

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    process.env.AUTH_SECRET =
      "integration-test-secret-with-more-than-thirty-two-characters";
    process.env.APP_URL = "http://localhost:3000";
    process.env.DEFAULT_TIMEZONE = "America/Guayaquil";

    const [{ database: db }, { hashPassword }] = await Promise.all([
      import("@/server/database"),
      import("@/server/auth/password"),
    ]);
    database = db;
    const passwordHash = await hashPassword(password);

    const schedule = await database.schedule.create({
      data: {
        name: marker,
        type: "INTERN",
        days: {
          create: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
            weekday,
            isWorkingDay: weekday <= 5,
            startTime:
              weekday <= 5
                ? new Date(
                    `1970-01-01T${weekday === 5 ? "08:00" : "08:30"}:00Z`,
                  )
                : null,
            endTime:
              weekday <= 5
                ? new Date(
                    `1970-01-01T${weekday === 5 ? "14:00" : "14:30"}:00Z`,
                  )
                : null,
            expectedMinutes: weekday <= 5 ? 360 : 0,
            breakMinutes: 0,
          })),
        },
      },
    });
    const admin = await database.user.create({
      data: {
        name: "Admin Integración",
        email: `${marker}-admin@example.test`,
        passwordHash,
        role: "ADMIN",
        createdAt: new Date("2026-07-20T00:00:00Z"),
      },
    });
    const user = await database.user.create({
      data: {
        name: "Usuario Integración",
        email: `${marker}-user@example.test`,
        passwordHash,
        scheduleId: schedule.id,
        createdAt: new Date("2026-07-26T00:00:00Z"),
      },
    });
    ids = { admin: admin.id, user: user.id, schedule: schedule.id };
  });

  afterAll(async () => {
    if (!database || !ids) return;
    await database.user.deleteMany({
      where: { id: { in: [ids.admin, ids.user] } },
    });
    await database.schedule.deleteMany({ where: { id: ids.schedule } });
    await database.$disconnect();
  });

  it("inicia sesión con contraseña cifrada", async () => {
    const { authenticateUser } = await import("@/server/auth/authenticate");
    const user = await authenticateUser(
      `${marker}-user@example.test`,
      password,
      { ipAddress: "127.0.0.1", userAgent: "vitest" },
    );

    expect(user.id).toBe(ids.user);
  });

  it("permite editar el perfil propio y cambiar la contraseña", async () => {
    const { updateOwnProfile, changeOwnPassword } =
      await import("@/server/services/user-service");
    const email = `${marker}-perfil@example.test`;
    const actor = {
      id: ids.user,
      name: "Usuario Integración",
      email: `${marker}-user@example.test`,
      role: "USER" as const,
      timezone: "America/Guayaquil",
    };
    const updated = await updateOwnProfile(actor, {
      name: "Usuario Perfil",
      email,
    });
    expect(updated.name).toBe("Usuario Perfil");
    expect(updated.email).toBe(email);

    const nextPassword = "Integration-Nueva-2026!";
    await changeOwnPassword(
      {
        id: "00000000-0000-4000-8000-000000000001",
        expiresAt: new Date("2027-01-01T00:00:00Z"),
        user: { ...actor, name: updated.name, email },
      },
      password,
      nextPassword,
    );
    const { authenticateUser } = await import("@/server/auth/authenticate");
    const authenticated = await authenticateUser(email, nextPassword, {
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    });
    expect(authenticated.id).toBe(ids.user);
  });

  it("registra 'cumplí mi horario' y actualiza sin duplicar", async () => {
    const { createDailyEntry } =
      await import("@/server/services/daily-entry-service");
    const actor = {
      id: ids.user,
      name: "Usuario Integración",
      email: `${marker}-user@example.test`,
      role: "USER" as const,
      timezone: "America/Guayaquil",
    };
    const input = {
      mode: "SCHEDULED" as const,
      date: "2026-07-20" as const,
      note: "Prueba integrada",
    };

    const entry = await createDailyEntry(actor, ids.user, input);
    expect(entry.workedMinutes).toBe(360);
    expect(entry.balanceMinutes).toBe(0);
    const updated = await createDailyEntry(actor, ids.user, input);
    expect(updated.id).toBe(entry.id);
    expect(
      await database.dailyEntry.count({
        where: {
          userId: ids.user,
          date: new Date("2026-07-20T00:00:00Z"),
        },
      }),
    ).toBe(1);
  });

  it("registra un permiso parcial sin acreditar las horas ausentes", async () => {
    const { createDailyEntry } =
      await import("@/server/services/daily-entry-service");
    const entry = await createDailyEntry(
      {
        id: ids.user,
        name: "Usuario Integración",
        email: `${marker}-user@example.test`,
        role: "USER",
        timezone: "America/Guayaquil",
      },
      ids.user,
      {
        mode: "PERMISSION",
        date: "2026-07-21",
        permissionKind: "UNIVERSITY",
        workedMinutes: 240,
        fullDay: false,
        reason: "Clases",
      },
    );

    expect(entry.permission?.durationMinutes).toBe(120);
    expect(entry.workedMinutes).toBe(240);
    expect(entry.balanceMinutes).toBe(-120);
  });

  it("registra horario diferente y recupera la deuda anterior", async () => {
    const { createDailyEntry } =
      await import("@/server/services/daily-entry-service");
    const entry = await createDailyEntry(
      {
        id: ids.user,
        name: "Usuario Integración",
        email: `${marker}-user@example.test`,
        role: "USER",
        timezone: "America/Guayaquil",
      },
      ids.user,
      {
        mode: "CUSTOM",
        date: "2026-07-22",
        startTime: "08:30",
        endTime: "16:30",
        note: "Recuperación",
      },
    );

    expect(entry.workedMinutes).toBe(480);
    expect(entry.balanceMinutes).toBe(120);
  });

  it("amplía una jornada registrada para recuperar sin duplicarla", async () => {
    const { createDailyEntry } =
      await import("@/server/services/daily-entry-service");
    const actor = {
      id: ids.user,
      name: "Usuario Integración",
      email: `${marker}-user@example.test`,
      role: "USER" as const,
      timezone: "America/Guayaquil",
    };
    const original = await createDailyEntry(actor, ids.user, {
      mode: "SCHEDULED",
      date: "2026-07-23",
    });
    const recovered = await createDailyEntry(actor, ids.user, {
      mode: "RECOVERY",
      date: "2026-07-23",
      endTime: "17:30",
    });

    expect(recovered.id).toBe(original.id);
    expect(recovered.workedMinutes).toBe(480);
    expect(recovered.breakMinutes).toBe(60);
    expect(recovered.balanceMinutes).toBe(120);
    expect(
      await database.dailyEntry.count({
        where: {
          userId: ids.user,
          date: new Date("2026-07-23T00:00:00Z"),
        },
      }),
    ).toBe(1);
  });

  it("unifica horario diferente, permiso parcial y recuperación", async () => {
    const { createDailyEntry, getScheduleForDate } =
      await import("@/server/services/daily-entry-service");
    const actor = {
      id: ids.user,
      name: "Usuario Integración",
      email: `${marker}-user@example.test`,
      role: "USER" as const,
      timezone: "America/Guayaquil",
    };
    const partial = await createDailyEntry(actor, ids.user, {
      mode: "DIFFERENT",
      date: "2026-07-24",
      startTime: "08:30",
      endTime: "11:30",
      permissionKind: "UNIVERSITY",
      reason: "Universidad",
    });
    expect(partial.workedMinutes).toBe(180);
    expect(partial.balanceMinutes).toBe(-180);
    expect(partial.permission?.durationMinutes).toBe(180);

    const recovered = await createDailyEntry(actor, ids.user, {
      mode: "DIFFERENT",
      date: "2026-07-24",
      startTime: "09:30",
      endTime: "17:30",
      reason: "Recuperación",
    });
    expect(recovered.id).toBe(partial.id);
    expect(recovered.workedMinutes).toBe(420);
    expect(recovered.balanceMinutes).toBe(60);
    expect(recovered.breakMinutes).toBe(60);
    expect(recovered.permission).toBeNull();
    expect(
      await database.dailyEntry.count({
        where: {
          userId: ids.user,
          date: new Date("2026-07-24T00:00:00Z"),
        },
      }),
    ).toBe(1);

    const selectedDay = await getScheduleForDate(ids.user, "2026-07-24");
    expect(selectedDay.existingEntry?.id).toBe(partial.id);
    expect(selectedDay.existingEntry?.startTime).toBe("09:30");
    expect(selectedDay.existingEntry?.endTime).toBe("17:30");
  }, 20_000);

  it("rechaza que un usuario consulte a otro", async () => {
    const { buildReportData } = await import("@/server/export/report-data");

    await expect(
      buildReportData(
        {
          id: ids.user,
          name: "Usuario Integración",
          email: `${marker}-user@example.test`,
          role: "USER",
          timezone: "America/Guayaquil",
        },
        ids.admin,
        "2026-07-20",
        "2026-07-22",
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("permite al administrador editar y eliminar otro usuario con sus jornadas", async () => {
    const { adminDeleteUser, adminUpdateUser } =
      await import("@/server/services/user-service");
    const admin = {
      id: ids.admin,
      name: "Admin Integración",
      email: `${marker}-admin@example.test`,
      role: "ADMIN" as const,
      timezone: "America/Guayaquil",
    };
    const edited = await adminUpdateUser(admin, ids.user, {
      name: "Usuario Editado",
      role: "USER",
      status: "ACTIVE",
      scheduleId: ids.schedule,
    });
    expect(edited.name).toBe("Usuario Editado");

    const deletable = await database.user.create({
      data: {
        name: "Usuario Eliminable",
        email: `${marker}-delete@example.test`,
        passwordHash: "hash-no-utilizado",
        scheduleId: ids.schedule,
        dailyEntries: {
          create: {
            date: new Date("2026-07-23T00:00:00Z"),
            scheduledMinutes: 360,
            workedMinutes: 360,
            balanceMinutes: 0,
            breakMinutes: 0,
            type: "SCHEDULED",
          },
        },
      },
      include: { dailyEntries: true },
    });
    const entryId = deletable.dailyEntries[0]?.id;
    expect(entryId).toBeTruthy();

    const deleted = await adminDeleteUser(admin, deletable.id);
    expect(deleted.deletedEntries).toBe(1);
    expect(
      await database.user.findUnique({ where: { id: deletable.id } }),
    ).toBeNull();
    expect(
      await database.dailyEntry.findUnique({ where: { id: entryId! } }),
    ).toBeNull();
    await expect(adminDeleteUser(admin, ids.admin)).rejects.toMatchObject({
      code: "CANNOT_DELETE_SELF",
    });
    await expect(
      adminDeleteUser(
        {
          id: ids.user,
          name: "Usuario",
          email: `${marker}-perfil@example.test`,
          role: "USER",
          timezone: "America/Guayaquil",
        },
        ids.admin,
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("calcula dashboard y genera PDF y Excel desde la misma fuente", async () => {
    const [
      { getDashboard },
      { buildReportData },
      { createReportPdf },
      { createReportExcel },
    ] = await Promise.all([
      import("@/server/services/balance-query-service"),
      import("@/server/export/report-data"),
      import("@/server/export/pdf"),
      import("@/server/export/excel"),
    ]);
    const actor = {
      id: ids.user,
      name: "Usuario Integración",
      email: `${marker}-user@example.test`,
      role: "USER" as const,
      timezone: "America/Guayaquil",
    };
    await database.dailyEntry.create({
      data: {
        userId: ids.user,
        date: new Date("2026-07-17T00:00:00Z"),
        scheduledMinutes: 360,
        workedMinutes: 300,
        balanceMinutes: -60,
        breakMinutes: 0,
        type: "CUSTOM",
        note: "Registro anterior a la creación de la cuenta",
      },
    });
    const dashboard = await getDashboard(ids.user, actor.timezone);
    expect(dashboard.recentDays.length).toBeGreaterThan(0);
    expect(dashboard.totalDebtMinutes).toBe(0);
    expect(dashboard.totalCreditMinutes).toBe(120);
    expect(dashboard.recoveredMinutes).toBe(180);

    const report = await buildReportData(
      actor,
      ids.user,
      "2026-07-20",
      "2026-07-22",
    );
    const [pdf, excel] = await Promise.all([
      createReportPdf(report),
      createReportExcel(report),
    ]);

    expect(pdf.byteLength).toBeGreaterThan(500);
    expect(excel.byteLength).toBeGreaterThan(1_000);
    expect(report.summary.workedMinutes).toBe(1_080);
    expect(report.summary.pendingMinutes).toBe(120);
    expect(report.summary.extraMinutes).toBe(120);
    expect(report.summary.recoveredMinutes).toBe(120);
    expect(report.summary.initialBalanceMinutes).toBe(-60);
    expect(report.summary.finalBalanceMinutes).toBe(-60);
    expect(report.summary.debtMinutes).toBe(60);
    expect(report.permissions).toHaveLength(1);
  });
});
