import { CloudOff, Clock3 } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="card max-w-md p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <CloudOff className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Estás sin conexión</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Puedes volver a una pantalla que ya esté abierta y guardar jornadas
          manuales o permisos. Los sincronizaremos cuando regrese internet.
        </p>
        <Link className="button-primary mt-6 w-full" href="/dashboard">
          <Clock3 className="h-5 w-5" />
          Intentar volver
        </Link>
      </div>
    </main>
  );
}
