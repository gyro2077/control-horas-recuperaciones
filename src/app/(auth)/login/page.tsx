import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { getCurrentSession } from "@/server/auth/session";

export const metadata: Metadata = { title: "Iniciar sesión" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentSession()) redirect("/dashboard");

  return (
    <>
      <div className="mb-8 lg:hidden">
        <p className="text-sm font-bold tracking-[0.15em] text-teal-700 uppercase">
          Control de Horas
        </p>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Qué bueno verte
      </h1>
      <p className="mt-2 text-slate-600">
        Ingresa para registrar tu jornada y revisar tu saldo.
      </p>
      <LoginForm />
    </>
  );
}
