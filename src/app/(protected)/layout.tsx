import { ChevronDown, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppNavigation } from "@/components/app-navigation";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const initials = session.user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen lg:pl-64">
      <AppNavigation canAdminister={session.user.role === "ADMIN"} />
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#f4f7f6]/88 px-4 backdrop-blur-xl sm:px-7">
        <div className="mx-auto flex h-17 max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.13em] text-teal-700 uppercase">
              Control de Horas
            </p>
            <p className="hidden text-sm text-slate-500 sm:block">
              Tus minutos, claros y al día
            </p>
          </div>
          <div className="flex items-center gap-2">
            <details className="group relative">
              <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pr-2 pl-1.5 select-none [&::-webkit-details-marker]:hidden">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-xs font-black text-teal-800">
                  {initials}
                </span>
                <span className="max-w-40 truncate text-sm font-semibold max-[420px]:hidden">
                  {session.user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
                <span className="sr-only">Abrir opciones de usuario</span>
              </summary>
              <div className="absolute top-[calc(100%+0.55rem)] right-0 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="truncate text-sm font-semibold">
                    {session.user.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {session.user.email}
                  </p>
                </div>
                <Link
                  href="/perfil"
                  className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Editar mi perfil
                </Link>
              </div>
            </details>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-7 lg:pb-10">
        {children}
      </main>
    </div>
  );
}
