-- Reinicio autorizado del modelo de la aplicación.
-- No se elimina spatial_ref_sys ni otras tablas administradas por extensiones.

DROP TABLE IF EXISTS "OfflineOperation" CASCADE;
DROP TABLE IF EXISTS "DashboardPreference" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "PeriodClosure" CASCADE;
DROP TABLE IF EXISTS "DailyBalance" CASCADE;
DROP TABLE IF EXISTS "TimeAdjustment" CASCADE;
DROP TABLE IF EXISTS "Holiday" CASCADE;
DROP TABLE IF EXISTS "Permission" CASCADE;
DROP TABLE IF EXISTS "PermissionType" CASCADE;
DROP TABLE IF EXISTS "BreakEntry" CASCADE;
DROP TABLE IF EXISTS "TimeEntry" CASCADE;
DROP TABLE IF EXISTS "WorkProfile" CASCADE;
DROP TABLE IF EXISTS "WorkScheduleDay" CASCADE;
DROP TABLE IF EXISTS "WorkSchedule" CASCADE;
DROP TABLE IF EXISTS "AuthThrottle" CASCADE;
DROP TABLE IF EXISTS "PasswordReset" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Team" CASCADE;
DROP TABLE IF EXISTS "AppSetting" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "OfflineOperationStatus" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
DROP TYPE IF EXISTS "PeriodType" CASCADE;
DROP TYPE IF EXISTS "AdjustmentType" CASCADE;
DROP TYPE IF EXISTS "HolidayType" CASCADE;
DROP TYPE IF EXISTS "PermissionStatus" CASCADE;
DROP TYPE IF EXISTS "TimeEntryStatus" CASCADE;
DROP TYPE IF EXISTS "TimeEntrySource" CASCADE;
DROP TYPE IF EXISTS "EmploymentType" CASCADE;
DROP TYPE IF EXISTS "UserStatus" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;

CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "ScheduleType" AS ENUM ('INTERN', 'FULL_TIME', 'CUSTOM');
CREATE TYPE "EntryType" AS ENUM ('SCHEDULED', 'CUSTOM', 'PERMISSION');
CREATE TYPE "PermissionKind" AS ENUM (
  'UNIVERSITY',
  'PERSONAL',
  'MEDICAL',
  'ILLNESS',
  'ABSENCE',
  'OTHER'
);

CREATE TABLE "Schedule" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(120) NOT NULL,
  "type" "ScheduleType" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(150) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "timezone" VARCHAR(80) NOT NULL DEFAULT 'America/Guayaquil',
  "scheduleId" UUID,
  "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP(3),
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScheduleDay" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "scheduleId" UUID NOT NULL,
  "weekday" INTEGER NOT NULL,
  "isWorkingDay" BOOLEAN NOT NULL DEFAULT false,
  "startTime" TIME(0),
  "endTime" TIME(0),
  "breakMinutes" INTEGER NOT NULL DEFAULT 0,
  "expectedMinutes" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ScheduleDay_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ScheduleDay_weekday_check" CHECK ("weekday" BETWEEN 1 AND 7),
  CONSTRAINT "ScheduleDay_minutes_check" CHECK (
    "breakMinutes" >= 0 AND
    "expectedMinutes" >= 0 AND
    "expectedMinutes" <= 1440
  ),
  CONSTRAINT "ScheduleDay_working_check" CHECK (
    NOT "isWorkingDay" OR ("startTime" IS NOT NULL AND "endTime" IS NOT NULL)
  )
);

CREATE TABLE "DailyEntry" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "date" DATE NOT NULL,
  "scheduledMinutes" INTEGER NOT NULL,
  "startDateTime" TIMESTAMP(3),
  "endDateTime" TIMESTAMP(3),
  "breakMinutes" INTEGER NOT NULL DEFAULT 0,
  "workedMinutes" INTEGER NOT NULL,
  "balanceMinutes" INTEGER NOT NULL,
  "type" "EntryType" NOT NULL,
  "note" VARCHAR(1000),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DailyEntry_minutes_check" CHECK (
    "scheduledMinutes" >= 0 AND
    "breakMinutes" >= 0 AND
    "workedMinutes" >= 0 AND
    "balanceMinutes" = "workedMinutes" - "scheduledMinutes"
  ),
  CONSTRAINT "DailyEntry_interval_check" CHECK (
    ("startDateTime" IS NULL AND "endDateTime" IS NULL) OR
    ("startDateTime" IS NOT NULL AND "endDateTime" IS NOT NULL AND "endDateTime" > "startDateTime")
  )
);

CREATE TABLE "Permission" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "dailyEntryId" UUID NOT NULL,
  "date" DATE NOT NULL,
  "kind" "PermissionKind" NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "fullDay" BOOLEAN NOT NULL DEFAULT false,
  "reason" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Permission_duration_check" CHECK ("durationMinutes" > 0)
);

CREATE TABLE "Session" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tokenHash" VARCHAR(64) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" VARCHAR(64),
  "userAgent" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthThrottle" (
  "keyHash" VARCHAR(64) NOT NULL,
  "failures" INTEGER NOT NULL DEFAULT 0,
  "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blockedUntil" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthThrottle_pkey" PRIMARY KEY ("keyHash")
);

CREATE UNIQUE INDEX "Schedule_name_key" ON "Schedule"("name");
CREATE INDEX "Schedule_active_type_idx" ON "Schedule"("active", "type");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_status_role_idx" ON "User"("status", "role");
CREATE INDEX "User_scheduleId_idx" ON "User"("scheduleId");
CREATE UNIQUE INDEX "ScheduleDay_scheduleId_weekday_key" ON "ScheduleDay"("scheduleId", "weekday");
CREATE INDEX "ScheduleDay_weekday_idx" ON "ScheduleDay"("weekday");
CREATE UNIQUE INDEX "DailyEntry_userId_date_key" ON "DailyEntry"("userId", "date");
CREATE INDEX "DailyEntry_userId_date_idx" ON "DailyEntry"("userId", "date");
CREATE UNIQUE INDEX "Permission_dailyEntryId_key" ON "Permission"("dailyEntryId");
CREATE INDEX "Permission_userId_date_idx" ON "Permission"("userId", "date");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "AuthThrottle_blockedUntil_idx" ON "AuthThrottle"("blockedUntil");

ALTER TABLE "User"
  ADD CONSTRAINT "User_scheduleId_fkey"
  FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ScheduleDay"
  ADD CONSTRAINT "ScheduleDay_scheduleId_fkey"
  FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyEntry"
  ADD CONSTRAINT "DailyEntry_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Permission"
  ADD CONSTRAINT "Permission_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Permission"
  ADD CONSTRAINT "Permission_dailyEntryId_fkey"
  FOREIGN KEY ("dailyEntryId") REFERENCES "DailyEntry"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session"
  ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
