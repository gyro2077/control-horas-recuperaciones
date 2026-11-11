import { CalendarRange, Users } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CreateScheduleForm } from "@/components/admin/create-schedule-form";
import { AdminEntryRow } from "@/components/admin/admin-entry-row";
import { UserAdminRow } from "@/components/admin/user-admin-row";
import { CreateUserForm } from "@/components/forms/create-user-form";
import { getCurrentSession } from "@/server/auth/session";
import { database } from "@/server/database";

export const metadata: Metadata = { title: "Administración" };
export const dynamic = "force-dynamic";

export default async function AdministrationPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const [users, schedules, recentEntries] = await database.$transaction([
    database.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        scheduleId: true,
        _count: { select: { dailyEntries: true } },
      },
      orderBy: { name: "asc" },
    }),
    database.schedule.findMany({
      where: { active: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
    database.dailyEntry.findMany({
      select: {
        id: true,
        date: true,
        workedMinutes: true,
        scheduledMinutes: true,
        updatedAt: true,
        user: { select: { name: true } },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold text-teal-700">Configuración básica</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Administración
        </h1>
        <p className="mt-2 text-slate-500">
          Crea compañeros, edita sus datos y administra sus accesos.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="card p-5">
          <Users className="h-5 w-5 text-teal-700" />
          <p className="mt-4 text-2xl font-semibold">{users.length}</p>
          <p className="text-sm text-slate-500">Usuarios</p>
        </article>
        <article className="card p-5">
          <CalendarRange className="h-5 w-5 text-teal-700" />
          <p className="mt-4 text-2xl font-semibold">{schedules.length}</p>
          <p className="text-sm text-slate-500">Horarios disponibles</p>
        </article>
      </section>

      <CreateUserForm schedules={schedules} />
      <CreateScheduleForm />

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold">Usuarios y horarios</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {users.map((user) => (
            <UserAdminRow
              key={user.id}
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                scheduleId: user.scheduleId,
                entryCount: user._count.dailyEntries,
              }}
              schedules={schedules}
              isCurrentUser={user.id === session.user.id}
            />
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold">Registros recientes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Corrige únicamente los minutos cuando un compañero se equivocó. El
            motivo queda guardado en la nota.
          </p>
        </div>
        {recentEntries.length ? (
          recentEntries.map((entry) => (
            <AdminEntryRow
              key={entry.id}
              entry={{
                id: entry.id,
                date: entry.date.toISOString().slice(0, 10),
                userName: entry.user.name,
                workedMinutes: entry.workedMinutes,
                scheduledMinutes: entry.scheduledMinutes,
                version: entry.updatedAt.toISOString(),
              }}
            />
          ))
        ) : (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            Todavía no existen registros.
          </p>
        )}
      </section>
    </div>
  );
}
