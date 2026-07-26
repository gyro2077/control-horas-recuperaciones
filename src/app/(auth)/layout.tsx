import { Clock3 } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#0b4f4a] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-lime-200/15" />
        <div className="relative flex items-center gap-3 text-lg font-bold">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/12">
            <Clock3 aria-hidden="true" />
          </span>
          Control de Horas
        </div>
        <div className="relative max-w-xl">
          <p className="mb-5 text-sm font-bold tracking-[0.18em] text-lime-200 uppercase">
            Simple, claro y confiable
          </p>
          <h1 className="text-5xl leading-[1.06] font-semibold tracking-tight">
            Entiende tu jornada sin hacer cuentas.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-teal-50/80">
            Registra en segundos y consulta cuánto cumpliste, cuánto te falta y
            cuánto ya recuperaste.
          </p>
        </div>
        <p className="relative text-sm text-teal-100/65">
          Tiempos calculados en minutos exactos · America/Guayaquil
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
