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

  it("corrige una jornada con versión, sin duplicar la nota y rechazando versiones antiguas", async () => {
    const { correctDailyEntry } =
      await import("@/server/services/daily-entry-service");
    const entry = await database.dailyEntry.create({
      data: {
        userId: ids.user,
        date: new Date("2026-07-30T00:00:00Z"),
        scheduledMinutes: 360,
        workedMinutes: 300,
        balanceMinutes: -60,
        breakMinutes: 0,
        type: "CUSTOM",
      },
    });
    const actor = {
      id: ids.admin,
      name: "Admin Integración",
      email: `${marker}-admin@example.test`,
      role: "ADMIN" as const,
      timezone: "America/Guayaquil",
    };
    const version = entry.updatedAt.toISOString();
    const corrected = await correctDailyEntry(actor, entry.id, {
      workedMinutes: 420,
      reason: "Ajuste de fichaje",
      version,
    });
    const replay = await correctDailyEntry(actor, entry.id, {
      workedMinutes: 420,
      reason: "Ajuste de fichaje",
      version,
    });
    expect(replay.updatedAt).toEqual(corrected.updatedAt);
    expect(replay.note?.match(/Corrección administrativa/g)).toHaveLength(1);
    expect(replay.balanceMinutes).toBe(60);

    await expect(
      correctDailyEntry(actor, entry.id, {
        workedMinutes: 360,
        reason: "Otra corrección",
        version,
      }),
    ).rejects.toMatchObject({ code: "ENTRY_VERSION_CONFLICT", status: 409 });
    await expect(
      correctDailyEntry(
        {
          ...actor,
          id: ids.user,
          role: "USER",
        },
        entry.id,
        {
          workedMinutes: 360,
          reason: "Sin permiso",
          version: corrected.updatedAt.toISOString(),
        },
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
  });

  it("guarda el descanso realmente tomado al registrar horas diferentes", async () => {
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
        mode: "DIFFERENT",
        date: "2026-07-31",
        startTime: "08:30",
        endTime: "15:30",
        breakMinutes: 60,
      },
    );

    expect(entry).toMatchObject({
      scheduledMinutes: 360,
      workedMinutes: 360,
      breakMinutes: 60,
      balanceMinutes: 0,
    });
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

  it("serializa confirmaciones concurrentes de una misma jornada", async () => {
    const { createDailyEntry } =
      await import("@/server/services/daily-entry-service");
    const actor = {
      id: ids.user,
      name: "Usuario Integración",
      email: `${marker}-user@example.test`,
      role: "USER" as const,
      timezone: "America/Guayaquil",
    };
    const [first, second] = await Promise.all([
      createDailyEntry(actor, ids.user, {
        mode: "DIFFERENT",
        date: "2026-07-27",
        startTime: "08:30",
        endTime: "15:00",
      }),
      createDailyEntry(actor, ids.user, {
        mode: "DIFFERENT",
        date: "2026-07-27",
        startTime: "08:30",
        endTime: "15:30",
      }),
    ]);

    expect(first.id).toBe(second.id);
    expect(
      await database.dailyEntry.count({
        where: {
          userId: ids.user,
          date: new Date("2026-07-27T00:00:00Z"),
        },
      }),
    ).toBe(1);
    const stored = await database.dailyEntry.findUniqueOrThrow({
      where: { id: first.id },
    });
    expect(stored.workedMinutes).toBe(second.workedMinutes);
  });

  it("compensa un día completo solo cuando el crédito cubre la jornada", async () => {
    const { createDailyEntry } =
      await import("@/server/services/daily-entry-service");
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
        date: new Date("2026-07-27T00:00:00.000Z"),
        scheduledMinutes: 360,
        workedMinutes: 720,
        balanceMinutes: 360,
        breakMinutes: 0,
        type: "CUSTOM",
      },
    });

    const compensated = await createDailyEntry(actor, ids.user, {
      mode: "COMPENSATED",
      date: "2026-07-28",
    });

    expect(compensated).toMatchObject({
      scheduledMinutes: 360,
      workedMinutes: 0,
      balanceMinutes: -360,
      breakMinutes: 0,
      type: "CUSTOM",
      startDateTime: null,
      endDateTime: null,
      permission: null,
    });
    await expect(
      createDailyEntry(actor, ids.user, {
        mode: "COMPENSATED",
        date: "2026-07-29",
      }),
    ).rejects.toMatchObject({ code: "INSUFFICIENT_CREDIT" });
  });

  it("registra permiso solo por el faltante que el crédito no cubre", async () => {
    const { createDailyEntry } =
      await import("@/server/services/daily-entry-service");
    const { calculateBalanceRange } =
      await import("@/server/services/balance-query-service");
    const isolatedUser = await database.user.create({
      data: {
        name: "Usuario Compensación Parcial",
        email: `${marker}-compensation@example.test`,
        passwordHash: "hash-no-utilizado",
        scheduleId: ids.schedule,
        createdAt: new Date("2026-07-30T05:00:00.000Z"),
      },
    });
    const actor = {
      id: isolatedUser.id,
      name: isolatedUser.name,
      email: isolatedUser.email,
      role: "USER" as const,
      timezone: "America/Guayaquil",
    };
    await database.dailyEntry.create({
      data: {
        userId: isolatedUser.id,
        date: new Date("2026-07-30T00:00:00.000Z"),
        scheduledMinutes: 360,
        workedMinutes: 390,
        balanceMinutes: 30,
        breakMinutes: 0,
        type: "CUSTOM",
      },
    });

    const entry = await createDailyEntry(actor, isolatedUser.id, {
      mode: "DIFFERENT",
      date: "2026-07-31",
      startTime: "08:30",
      endTime: "12:30",
      permissionKind: "PERSONAL",
      reason: "Cita médica",
    });
    const range = await calculateBalanceRange(
      isolatedUser.id,
      actor.timezone,
      "2026-07-31",
      "2026-07-31",
      { now: new Date("2026-08-01T17:00:00.000Z") },
    );

    expect(entry).toMatchObject({
      workedMinutes: 240,
      balanceMinutes: -120,
      permission: { durationMinutes: 90, reason: "Cita médica" },
    });
    expect(range.days[0]).toMatchObject({
      compensatedMinutes: 30,
      pendingMinutes: 90,
    });
    await database.user.delete({ where: { id: isolatedUser.id } });
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

  describe("saldo con apertura", () => {
    let targetUserId: string;
    const timezone = "America/Guayaquil";
    const now = new Date("2026-07-22T17:00:00Z");

    beforeAll(async () => {
      const template = await database.user.findUniqueOrThrow({
        where: { id: ids.user },
        select: { passwordHash: true },
      });
      const target = await database.user.create({
        data: {
          name: "Saldo Integración",
          email: `${marker}-balance@example.test`,
          passwordHash: template.passwordHash,
          timezone,
          scheduleId: ids.schedule,
          createdAt: new Date("2026-07-20T05:00:00Z"),
          dailyEntries: {
            create: [
              { date: "2026-07-20", workedMinutes: 480 },
              { date: "2026-07-21", workedMinutes: 300 },
              { date: "2026-07-23", workedMinutes: 900 },
            ].map(({ date, workedMinutes }) => ({
              date: new Date(`${date}T00:00:00Z`),
              scheduledMinutes: 360,
              workedMinutes,
              balanceMinutes: workedMinutes - 360,
              breakMinutes: 0,
              type: "CUSTOM",
            })),
          },
        },
      });
      targetUserId = target.id;
    });

    afterAll(async () => {
      if (targetUserId) {
        await database.user.delete({ where: { id: targetUserId } });
      }
    });

    it("conserva el cierre al cambiar el inicio de la ventana", async () => {
      const { calculateBalanceRange } =
        await import("@/server/services/balance-query-service");
      const full = await calculateBalanceRange(
        targetUserId,
        timezone,
        "2026-07-20",
        "2026-07-21",
        { now },
      );
      const partial = await calculateBalanceRange(
        targetUserId,
        timezone,
        "2026-07-21",
        "2026-07-21",
        { now },
      );

      expect(full.initialBalanceMinutes).toBe(0);
      expect(full.balanceMinutes).toBe(60);
      expect(partial.initialBalanceMinutes).toBe(120);
      expect(partial.balanceMinutes).toBe(full.balanceMinutes);
      expect(partial.days).toHaveLength(1);
      expect(partial.days[0]).toMatchObject({
        date: "2026-07-21",
        creditUsedMinutes: 60,
        creditMinutes: 60,
        debtMinutes: 0,
      });
      expect(partial.calculatedAt).toEqual(now);
      expect(partial.asOfDate).toBe("2026-07-21");
    });

    it("expone la fotografía de la jornada existente y el saldo anterior", async () => {
      const entryDate = new Date("2026-07-21T00:00:00.000Z");
      await database.dailyEntry.update({
        where: {
          userId_date: { userId: targetUserId, date: entryDate },
        },
        data: {
          scheduledMinutes: 420,
          startDateTime: new Date("2026-07-21T13:30:00.000Z"),
          endDateTime: new Date("2026-07-21T21:30:00.000Z"),
          workedMinutes: 450,
          balanceMinutes: 30,
          breakMinutes: 30,
        },
      });
      const { getScheduleForDate } =
        await import("@/server/services/daily-entry-service");

      const result = await getScheduleForDate(targetUserId, "2026-07-21", {
        now,
      });

      expect(result.view).toMatchObject({
        expectedMinutes: 420,
        breakMinutes: 30,
        balanceBeforeDateMinutes: 120,
        timezone,
      });
      expect(result.existingEntry).toMatchObject({
        id: expect.any(String),
        version: expect.any(String),
        scheduledMinutes: 420,
        breakMinutes: 30,
        startTime: "08:30",
        endTime: "16:30",
        workedMinutes: 450,
      });
      expect(new Date(result.existingEntry!.version!).toISOString()).toBe(
        result.existingEntry!.version,
      );
    });

    it("obtiene el saldo anterior sin la fecha evaluada ni fechas posteriores", async () => {
      const { getBalanceBeforeDate } =
        await import("@/server/services/balance-query-service");

      expect(
        await getBalanceBeforeDate(targetUserId, "2026-07-20", { now }),
      ).toBe(0);
      expect(
        await getBalanceBeforeDate(targetUserId, "2026-07-21", { now }),
      ).toBe(120);
      expect(
        await getBalanceBeforeDate(targetUserId, "2026-07-22", { now }),
      ).toBe(60);
    });

    it("reutiliza el lector transaccional sin modificar jornadas ni usuario", async () => {
      const { calculateBalanceRange, getBalanceBeforeDate } =
        await import("@/server/services/balance-query-service");
      const before = await database.user.findUniqueOrThrow({
        where: { id: targetUserId },
        select: { updatedAt: true, dailyEntries: { orderBy: { date: "asc" } } },
      });
      const result = await database.$transaction(
        async (client) => {
          const range = await calculateBalanceRange(
            targetUserId,
            timezone,
            "2026-07-21",
            "2026-07-21",
            { now, client },
          );
          const previous = await getBalanceBeforeDate(
            targetUserId,
            "2026-07-21",
            { now, client },
          );
          return { range, previous };
        },
        { isolationLevel: "RepeatableRead" },
      );
      const after = await database.user.findUniqueOrThrow({
        where: { id: targetUserId },
        select: { updatedAt: true, dailyEntries: { orderBy: { date: "asc" } } },
      });

      expect(result.previous).toBe(120);
      expect(result.range.balanceMinutes).toBe(60);
      expect(after).toEqual(before);
    });

    it("calcula dashboard con el instante recibido y sin deuda por días posteriores", async () => {
      const { getDashboard } =
        await import("@/server/services/balance-query-service");
      const dashboard = await getDashboard(targetUserId, timezone, now);

      expect(dashboard.today).toBe("2026-07-22");
      expect(dashboard.totalDebtMinutes).toBe(0);
      expect(dashboard.totalCreditMinutes).toBe(60);
      expect(dashboard.todayDay?.status).toBe("IN_PROGRESS");
    });

    it("mantiene la fecha actual y los registros futuros fuera del saldo consolidado", async () => {
      const { calculateBalanceRange } =
        await import("@/server/services/balance-query-service");
      const range = await calculateBalanceRange(
        targetUserId,
        timezone,
        "2026-07-22",
        "2026-07-23",
        { now },
      );

      expect(range.initialBalanceMinutes).toBe(60);
      expect(range.balanceMinutes).toBe(60);
      expect(range.asOfDate).toBe("2026-07-22");
      expect(range.days.map((day) => day.balanceMinutes)).toEqual([0, 0]);
      expect(range.days.map((day) => day.status)).toEqual([
        "IN_PROGRESS",
        "FUTURE",
      ]);
    });
  });

  describe("contexto de adelanto", () => {
    let targetUserId: string;
    const now = new Date("2026-07-21T17:00:00Z");

    beforeAll(async () => {
      const template = await database.user.findUniqueOrThrow({
        where: { id: ids.user },
        select: { passwordHash: true },
      });
      const target = await database.user.create({
        data: {
          name: "Contexto Integración",
          email: `${marker}-context@example.test`,
          passwordHash: template.passwordHash,
          timezone: "America/Guayaquil",
          scheduleId: ids.schedule,
          createdAt: new Date("2026-07-20T05:00:00Z"),
          dailyEntries: {
            create: [
              { date: "2026-07-20", workedMinutes: 390 },
              { date: "2026-07-21", workedMinutes: 420 },
            ].map(({ date, workedMinutes }) => ({
              date: new Date(`${date}T00:00:00Z`),
              scheduledMinutes: 360,
              workedMinutes,
              balanceMinutes: workedMinutes - 360,
              breakMinutes: 0,
              type: "CUSTOM",
              note: "Nota de contexto",
            })),
          },
        },
      });
      targetUserId = target.id;
    });

    afterAll(async () => {
      if (targetUserId) {
        await database.user.delete({ where: { id: targetUserId } });
      }
    });

    it("incluye saldo anterior, zona y referencia sin sumar el día editado", async () => {
      const { getScheduleForDate } =
        await import("@/server/services/daily-entry-service");
      const result = await getScheduleForDate(targetUserId, "2026-07-21", {
        now,
      });

      expect(result.view).toMatchObject({
        date: "2026-07-21",
        expectedMinutes: 360,
        balanceBeforeDateMinutes: 30,
        timezone: "America/Guayaquil",
        calculatedAt: now,
      });
      expect(result.existingEntry).toMatchObject({
        workedMinutes: 420,
        balanceMinutes: 60,
        reason: "Nota de contexto",
      });
    });

    it("conserva los campos públicos del horario sin filtrar el contexto interno", async () => {
      const { getScheduleForDate } =
        await import("@/server/services/daily-entry-service");
      const result = await getScheduleForDate(targetUserId, "2026-07-21", {
        now,
      });
      const publicData = {
        schedule: result.view,
        existingEntry: result.existingEntry,
      };

      expect(publicData.schedule).toMatchObject({
        date: "2026-07-21",
        scheduleName: marker,
        scheduleType: "INTERN",
        isWorkingDay: true,
        startTime: "08:30",
        endTime: "14:30",
        breakMinutes: 0,
        expectedMinutes: 360,
        balanceBeforeDateMinutes: 30,
      });
      expect(JSON.stringify(publicData)).not.toMatch(
        /"passwordHash"|"sessions"|"failedLoginAttempts"|"lockedUntil"|"user"|"dailyEntries"/,
      );
    });

    it("reutiliza un lector transaccional sin modificar el registro", async () => {
      const { getScheduleForDate } =
        await import("@/server/services/daily-entry-service");
      const before = await database.user.findUniqueOrThrow({
        where: { id: targetUserId },
        select: { updatedAt: true, dailyEntries: { orderBy: { date: "asc" } } },
      });
      const result = await database.$transaction(
        (client) =>
          getScheduleForDate(targetUserId, "2026-07-21", { now, client }),
        { isolationLevel: "RepeatableRead" },
      );
      const after = await database.user.findUniqueOrThrow({
        where: { id: targetUserId },
        select: { updatedAt: true, dailyEntries: { orderBy: { date: "asc" } } },
      });

      expect(result.view.balanceBeforeDateMinutes).toBe(30);
      expect(result.existingEntry?.balanceMinutes).toBe(60);
      expect(after).toEqual(before);
    });
  });
});
