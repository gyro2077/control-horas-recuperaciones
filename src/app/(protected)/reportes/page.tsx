import { DateTime } from "luxon";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReportForm } from "@/components/forms/report-form";
import { getCurrentSession } from "@/server/auth/session";
import { database } from "@/server/database";

export const metadata: Metadata = { title: "Reportes" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const now = DateTime.now().setZone(session.user.timezone);
  const defaultFrom = now.startOf("month").toISODate() ?? "";
  const defaultTo = now.toISODate() ?? "";
  const weekFrom = now.startOf("week").toISODate() ?? "";
  const weekTo = defaultTo;
  const users =
    session.user.role === "ADMIN"
      ? await database.user.findMany({
          where: { status: "ACTIVE", role: "USER" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [{ id: session.user.id, name: session.user.name }];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold text-teal-700">Tu información</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Reportes</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Descarga un Excel claro con tus horas, saldo y permisos. También
          puedes generar una copia en PDF.
        </p>
      </header>

      <ReportForm
        currentUserId={users[0]?.id ?? session.user.id}
        defaultFrom={defaultFrom}
        defaultTo={defaultTo}
        weekFrom={weekFrom}
        weekTo={weekTo}
        today={defaultTo}
        users={users}
      />
    </div>
  );
}
