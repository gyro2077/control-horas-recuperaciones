"use client";

import { LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateUserForm({
  schedules,
}: Readonly<{
  schedules: readonly {
    id: string;
    name: string;
    type: "INTERN" | "FULL_TIME" | "CUSTOM";
  }[];
}>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const defaultScheduleId =
    schedules.find((schedule) => schedule.type === "INTERN")?.id ??
    schedules[0]?.id ??
    "";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const role = String(form.get("role"));
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "control-horas-pwa",
        },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          role,
          scheduleId: role === "ADMIN" ? null : form.get("scheduleId"),
        }),
      });
      const body = (await response.json()) as {
        error?: { code?: string; message?: string };
      };
      if (!response.ok) {
        if (body.error?.code === "EMAIL_ALREADY_EXISTS") {
          setMessage(
            "La cuenta ya existe. La encontrarás en la lista de usuarios.",
          );
          router.refresh();
          return;
        }
        throw new Error(body.error?.message ?? "No se pudo crear el usuario.");
      }
      setMessage("Usuario creado y horario asignado.");
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <p className="text-sm font-bold text-teal-700">Nuevo compañero</p>
      <h2 className="mt-1 text-xl font-semibold">Crear usuario</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label" htmlFor="user-name">
            Nombre
          </label>
          <input id="user-name" name="name" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="user-email">
            Correo
          </label>
          <input
            id="user-email"
            name="email"
            className="input"
            type="email"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="user-password">
            Contraseña inicial
          </label>
          <input
            id="user-password"
            name="password"
            className="input"
            type="password"
            minLength={12}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="user-role">
            Rol
          </label>
          <select
            id="user-role"
            name="role"
            className="input"
            defaultValue="USER"
          >
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="user-schedule">
            Horario
          </label>
          <select
            id="user-schedule"
            name="scheduleId"
            className="input"
            defaultValue={defaultScheduleId}
            required
          >
            {schedules.map((schedule) => (
              <option value={schedule.id} key={schedule.id}>
                {schedule.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {message ? (
        <p role="status" className="mt-4 text-sm text-slate-600">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        className="button-primary mt-5"
        disabled={loading || !schedules.length}
      >
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <UserPlus className="h-5 w-5" />
        )}
        Crear usuario
      </button>
    </form>
  );
}
