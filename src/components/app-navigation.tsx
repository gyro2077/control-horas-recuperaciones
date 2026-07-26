"use client";

import {
  ChartNoAxesCombined,
  ClipboardPlus,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/registro", label: "Registrar", icon: ClipboardPlus },
  { href: "/historial", label: "Historial", icon: ClipboardList },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
] as const;

export function AppNavigation({
  canAdminister,
}: Readonly<{ canAdminister: boolean }>) {
  const pathname = usePathname();
  const allItems = canAdminister
    ? [
        ...items,
        {
          href: "/administracion",
          label: "Administrar",
          icon: Settings2,
        },
      ]
    : items;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white/92 px-4 py-5 backdrop-blur lg:flex">
        <Link
          href="/dashboard"
          className="mb-8 flex items-center gap-3 px-2 font-bold tracking-tight text-slate-900"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-700 text-white shadow-sm">
            <ChartNoAxesCombined className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="leading-5">
            Control de
            <br />
            Horas
          </span>
        </Link>
        <nav aria-label="Navegación principal" className="space-y-1">
          {allItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                  active
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-teal-950 p-4 text-white">
          <p className="text-sm font-bold">¿Horas pendientes?</p>
          <p className="mt-1 text-xs leading-5 text-teal-100/75">
            Cada minuto adicional se aplica automáticamente a tu deuda.
          </p>
        </div>
      </aside>
      <nav
        aria-label="Navegación móvil"
        className={`fixed right-0 bottom-0 left-0 z-40 grid border-t border-slate-200 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden ${
          canAdminister ? "grid-cols-5" : "grid-cols-4"
        }`}
      >
        {allItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold ${
                active ? "text-teal-700" : "text-slate-500"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
