import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/forms/profile-form";
import { getCurrentSession } from "@/server/auth/session";
import { database } from "@/server/database";

export const metadata: Metadata = { title: "Mi perfil" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      timezone: true,
      schedule: { select: { name: true } },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold text-teal-700">Mi cuenta</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Mi perfil
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Actualiza tus datos y protege el acceso a tu cuenta.
        </p>
      </header>
      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          timezone: user.timezone,
          scheduleName: user.schedule?.name ?? null,
        }}
      />
    </div>
  );
}
