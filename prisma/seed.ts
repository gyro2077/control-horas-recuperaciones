import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import {
  PrismaClient,
  Role,
  ScheduleType,
  UserStatus,
} from "../src/generated/prisma/client";

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable ${name}.`);
  return value;
}

const database = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: requiredEnvironment("DATABASE_URL"),
    max: 1,
  }),
});

function localTime(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

function scheduleDays(type: ScheduleType) {
  return [1, 2, 3, 4, 5, 6, 7].map((weekday) => {
    const working = weekday <= 5;
    const friday = weekday === 5;
    const fullTime = type === ScheduleType.FULL_TIME;
    return {
      weekday,
      isWorkingDay: working,
      startTime: working ? localTime(friday ? "08:00" : "08:30") : null,
      endTime: working
        ? localTime(friday ? "14:00" : fullTime ? "17:30" : "14:30")
        : null,
      breakMinutes: working && fullTime && !friday ? 60 : 0,
      expectedMinutes: working ? (fullTime && !friday ? 480 : 360) : 0,
    };
  });
}

async function upsertSchedule(name: string, type: ScheduleType) {
  return database.schedule.upsert({
    where: { name },
    update: {
      active: true,
      type,
      days: {
        deleteMany: {},
        create: scheduleDays(type),
      },
    },
    create: {
      name,
      type,
      days: { create: scheduleDays(type) },
    },
  });
}

async function main() {
  const adminPasswordHash = await hash(
    requiredEnvironment("SEED_ADMIN_PASSWORD"),
    12,
  );
  const [internSchedule, fullTimeSchedule] = await Promise.all([
    upsertSchedule("Pasante / trainee · 30 h", ScheduleType.INTERN),
    upsertSchedule("Jornada completa", ScheduleType.FULL_TIME),
  ]);

  await database.user.upsert({
    where: { email: "admin@controlhoras.local" },
    update: {
      name: "Administrador",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      scheduleId: null,
    },
    create: {
      name: "Administrador",
      email: "admin@controlhoras.local",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.info(
    `Seed simplificado aplicado: ${internSchedule.name} y ${fullTimeSchedule.name}.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => database.$disconnect());
