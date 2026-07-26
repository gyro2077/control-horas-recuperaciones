import Link from "next/link";

export default function RecoverPage() {
  return (
    <div className="card p-7">
      <p className="text-sm font-bold tracking-[0.15em] text-teal-700 uppercase">
        Recuperar acceso
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Solicita una nueva clave</h1>
      <p className="mt-3 leading-7 text-slate-600">
        En este MVP el restablecimiento lo realiza un administrador para evitar
        enviar enlaces sin un proveedor de correo configurado. Contacta a tu
        supervisor o al administrador del sistema.
      </p>
      <Link className="button-primary mt-6 w-full" href="/login">
        Volver al inicio de sesión
      </Link>
    </div>
  );
}
