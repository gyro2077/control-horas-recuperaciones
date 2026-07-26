-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('INTERN', 'TRAINEE', 'FULL_TIME', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TimeEntrySource" AS ENUM ('TIMER', 'MANUAL', 'IMPORTED', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TimeEntryStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CORRECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PermissionStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('NATIONAL', 'INSTITUTIONAL', 'NON_WORKING', 'REDUCED', 'RECOVERY');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('CORRECTION', 'RECOVERY', 'BONUS', 'PENALTY', 'OTHER');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('WEEK', 'MONTH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PERMISSION_APPROVED', 'PERMISSION_REJECTED', 'ENTRY_REJECTED', 'OPEN_ENTRY_WARNING', 'WEEKLY_DEBT', 'DEBT_RECOVERED', 'SCHEDULE_CHANGED', 'ADMIN_CORRECTION');

-- CreateEnum
CREATE TYPE "OfflineOperationStatus" AS ENUM ('PENDING', 'APPLIED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "timezone" VARCHAR(80) NOT NULL DEFAULT 'America/Guayaquil',
    "teamId" UUID,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "supervisorId" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" VARCHAR(64),
    "userAgent" VARCHAR(512),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthThrottle" (
    "id" UUID NOT NULL,
    "keyHash" CHAR(64) NOT NULL,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthThrottle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSchedule" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkScheduleDay" (
    "id" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "weekday" INTEGER NOT NULL,
    "isWorkingDay" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TIME(0),
    "endTime" TIME(0),
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "expectedMinutes" INTEGER NOT NULL DEFAULT 0,
    "entryToleranceMinutes" INTEGER NOT NULL DEFAULT 0,
    "exitToleranceMinutes" INTEGER NOT NULL DEFAULT 0,
    "allowExtraTime" BOOLEAN NOT NULL DEFAULT true,
    "allowRecoveryExtraTime" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WorkScheduleDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "weeklyTargetMinutes" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "allowRecovery" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3),
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "workedMinutes" INTEGER,
    "source" "TimeEntrySource" NOT NULL,
    "status" "TimeEntryStatus" NOT NULL DEFAULT 'DRAFT',
    "note" VARCHAR(1000),
    "manualReason" VARCHAR(500),
    "clientOperationId" VARCHAR(100),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID NOT NULL,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakEntry" (
    "id" UUID NOT NULL,
    "timeEntryId" UUID NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionType" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "affectsBalance" BOOLEAN NOT NULL DEFAULT true,
    "countsAsWorked" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "permissionTypeId" UUID NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "fullDay" BOOLEAN NOT NULL DEFAULT false,
    "reason" VARCHAR(500) NOT NULL,
    "observation" VARCHAR(1000),
    "attachmentPath" VARCHAR(500),
    "attachmentName" VARCHAR(255),
    "attachmentMimeType" VARCHAR(100),
    "attachmentSize" INTEGER,
    "status" "PermissionStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" VARCHAR(500),
    "clientOperationId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "type" "HolidayType" NOT NULL DEFAULT 'NATIONAL',
    "expectedMinutes" INTEGER NOT NULL DEFAULT 0,
    "affectsBalance" BOOLEAN NOT NULL DEFAULT false,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeAdjustment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "minutes" INTEGER NOT NULL,
    "adjustmentType" "AdjustmentType" NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "evidencePath" VARCHAR(500),
    "previousData" JSONB,
    "newData" JSONB,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyBalance" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "scheduledMinutes" INTEGER NOT NULL,
    "workedMinutes" INTEGER NOT NULL,
    "justifiedMinutes" INTEGER NOT NULL,
    "adjustmentMinutes" INTEGER NOT NULL,
    "creditedMinutes" INTEGER NOT NULL,
    "balanceMinutes" INTEGER NOT NULL,
    "recoveredMinutes" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculationHash" CHAR(64) NOT NULL,

    CONSTRAINT "DailyBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodClosure" (
    "id" UUID NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "userId" UUID,
    "teamId" UUID,
    "finalBalanceMinutes" INTEGER NOT NULL,
    "reason" VARCHAR(500),
    "closedById" UUID NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reopenedById" UUID,
    "reopenedAt" TIMESTAMP(3),
    "reopenReason" VARCHAR(500),

    CONSTRAINT "PeriodClosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(100) NOT NULL,
    "previousData" JSONB,
    "newData" JSONB,
    "ipAddress" VARCHAR(64),
    "userAgent" VARCHAR(512),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "link" VARCHAR(500),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "cardOrder" JSONB NOT NULL,
    "hiddenCards" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflineOperation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "clientOperationId" VARCHAR(100) NOT NULL,
    "operationType" VARCHAR(100) NOT NULL,
    "payloadHash" CHAR(64) NOT NULL,
    "status" "OfflineOperationStatus" NOT NULL DEFAULT 'PENDING',
    "resultEntityId" VARCHAR(100),
    "errorCode" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "OfflineOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" VARCHAR(500),
    "updatedById" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_teamId_status_idx" ON "User"("teamId", "status");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE INDEX "Team_supervisorId_active_idx" ON "Team"("supervisorId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "AuthThrottle_keyHash_key" ON "AuthThrottle"("keyHash");

-- CreateIndex
CREATE INDEX "AuthThrottle_blockedUntil_idx" ON "AuthThrottle"("blockedUntil");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_expiresAt_idx" ON "PasswordReset"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "WorkSchedule_active_effectiveFrom_effectiveTo_idx" ON "WorkSchedule"("active", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "WorkSchedule_name_version_key" ON "WorkSchedule"("name", "version");

-- CreateIndex
CREATE INDEX "WorkScheduleDay_weekday_idx" ON "WorkScheduleDay"("weekday");

-- CreateIndex
CREATE UNIQUE INDEX "WorkScheduleDay_scheduleId_weekday_key" ON "WorkScheduleDay"("scheduleId", "weekday");

-- CreateIndex
CREATE INDEX "WorkProfile_userId_active_startDate_endDate_idx" ON "WorkProfile"("userId", "active", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "WorkProfile_userId_startDate_key" ON "WorkProfile"("userId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "TimeEntry_clientOperationId_key" ON "TimeEntry"("clientOperationId");

-- CreateIndex
CREATE INDEX "TimeEntry_userId_date_status_idx" ON "TimeEntry"("userId", "date", "status");

-- CreateIndex
CREATE INDEX "TimeEntry_userId_startDateTime_endDateTime_idx" ON "TimeEntry"("userId", "startDateTime", "endDateTime");

-- CreateIndex
CREATE INDEX "BreakEntry_timeEntryId_startDateTime_idx" ON "BreakEntry"("timeEntryId", "startDateTime");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionType_name_key" ON "PermissionType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_clientOperationId_key" ON "Permission"("clientOperationId");

-- CreateIndex
CREATE INDEX "Permission_userId_startDateTime_endDateTime_idx" ON "Permission"("userId", "startDateTime", "endDateTime");

-- CreateIndex
CREATE INDEX "Permission_status_createdAt_idx" ON "Permission"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_date_key" ON "Holiday"("date");

-- CreateIndex
CREATE INDEX "Holiday_type_date_idx" ON "Holiday"("type", "date");

-- CreateIndex
CREATE INDEX "TimeAdjustment_userId_date_idx" ON "TimeAdjustment"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyBalance_userId_date_balanceMinutes_idx" ON "DailyBalance"("userId", "date", "balanceMinutes");

-- CreateIndex
CREATE UNIQUE INDEX "DailyBalance_userId_date_key" ON "DailyBalance"("userId", "date");

-- CreateIndex
CREATE INDEX "PeriodClosure_userId_startDate_endDate_idx" ON "PeriodClosure"("userId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "PeriodClosure_teamId_startDate_endDate_idx" ON "PeriodClosure"("teamId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardPreference_userId_key" ON "DashboardPreference"("userId");

-- CreateIndex
CREATE INDEX "OfflineOperation_userId_status_createdAt_idx" ON "OfflineOperation"("userId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OfflineOperation_userId_clientOperationId_key" ON "OfflineOperation"("userId", "clientOperationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSchedule" ADD CONSTRAINT "WorkSchedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkScheduleDay" ADD CONSTRAINT "WorkScheduleDay_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "WorkSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProfile" ADD CONSTRAINT "WorkProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProfile" ADD CONSTRAINT "WorkProfile_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "WorkSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakEntry" ADD CONSTRAINT "BreakEntry_timeEntryId_fkey" FOREIGN KEY ("timeEntryId") REFERENCES "TimeEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_permissionTypeId_fkey" FOREIGN KEY ("permissionTypeId") REFERENCES "PermissionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeAdjustment" ADD CONSTRAINT "TimeAdjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeAdjustment" ADD CONSTRAINT "TimeAdjustment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyBalance" ADD CONSTRAINT "DailyBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodClosure" ADD CONSTRAINT "PeriodClosure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodClosure" ADD CONSTRAINT "PeriodClosure_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodClosure" ADD CONSTRAINT "PeriodClosure_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodClosure" ADD CONSTRAINT "PeriodClosure_reopenedById_fkey" FOREIGN KEY ("reopenedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardPreference" ADD CONSTRAINT "DashboardPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfflineOperation" ADD CONSTRAINT "OfflineOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Domain invariants that Prisma cannot express directly.
ALTER TABLE "User"
    ADD CONSTRAINT "User_failedLoginAttempts_check"
    CHECK ("failedLoginAttempts" >= 0);

ALTER TABLE "AuthThrottle"
    ADD CONSTRAINT "AuthThrottle_failures_check"
    CHECK ("failures" >= 0);

ALTER TABLE "WorkSchedule"
    ADD CONSTRAINT "WorkSchedule_effectiveRange_check"
    CHECK ("effectiveTo" IS NULL OR "effectiveTo" >= "effectiveFrom");

ALTER TABLE "WorkScheduleDay"
    ADD CONSTRAINT "WorkScheduleDay_weekday_check"
    CHECK ("weekday" BETWEEN 1 AND 7),
    ADD CONSTRAINT "WorkScheduleDay_minutes_check"
    CHECK (
        "breakMinutes" >= 0
        AND "expectedMinutes" >= 0
        AND "entryToleranceMinutes" >= 0
        AND "exitToleranceMinutes" >= 0
    ),
    ADD CONSTRAINT "WorkScheduleDay_hours_check"
    CHECK (
        ("isWorkingDay" = false)
        OR ("startTime" IS NOT NULL AND "endTime" IS NOT NULL AND "endTime" > "startTime")
    );

ALTER TABLE "WorkProfile"
    ADD CONSTRAINT "WorkProfile_effectiveRange_check"
    CHECK ("endDate" IS NULL OR "endDate" >= "startDate"),
    ADD CONSTRAINT "WorkProfile_target_check"
    CHECK ("weeklyTargetMinutes" >= 0);

ALTER TABLE "TimeEntry"
    ADD CONSTRAINT "TimeEntry_interval_check"
    CHECK ("endDateTime" IS NULL OR "endDateTime" > "startDateTime"),
    ADD CONSTRAINT "TimeEntry_minutes_check"
    CHECK (
        "breakMinutes" >= 0
        AND ("workedMinutes" IS NULL OR "workedMinutes" >= 0)
    );

ALTER TABLE "BreakEntry"
    ADD CONSTRAINT "BreakEntry_interval_check"
    CHECK ("endDateTime" IS NULL OR "endDateTime" > "startDateTime"),
    ADD CONSTRAINT "BreakEntry_duration_check"
    CHECK ("durationMinutes" IS NULL OR "durationMinutes" >= 0);

ALTER TABLE "Permission"
    ADD CONSTRAINT "Permission_interval_check"
    CHECK ("endDateTime" > "startDateTime"),
    ADD CONSTRAINT "Permission_duration_check"
    CHECK ("durationMinutes" > 0),
    ADD CONSTRAINT "Permission_attachmentSize_check"
    CHECK ("attachmentSize" IS NULL OR "attachmentSize" >= 0);

ALTER TABLE "Holiday"
    ADD CONSTRAINT "Holiday_expectedMinutes_check"
    CHECK ("expectedMinutes" >= 0);

ALTER TABLE "DailyBalance"
    ADD CONSTRAINT "DailyBalance_minutes_check"
    CHECK (
        "scheduledMinutes" >= 0
        AND "workedMinutes" >= 0
        AND "justifiedMinutes" >= 0
        AND "creditedMinutes" >= 0
        AND "recoveredMinutes" >= 0
    );

ALTER TABLE "PeriodClosure"
    ADD CONSTRAINT "PeriodClosure_range_check"
    CHECK ("endDate" >= "startDate"),
    ADD CONSTRAINT "PeriodClosure_scope_check"
    CHECK (NOT ("userId" IS NOT NULL AND "teamId" IS NOT NULL));

-- Race-condition protection for timer operations.
CREATE UNIQUE INDEX "TimeEntry_one_open_per_user"
    ON "TimeEntry" ("userId")
    WHERE "endDateTime" IS NULL;

CREATE UNIQUE INDEX "BreakEntry_one_open_per_entry"
    ON "BreakEntry" ("timeEntryId")
    WHERE "endDateTime" IS NULL;
