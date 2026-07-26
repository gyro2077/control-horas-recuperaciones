"use client";

import { KeyRound, Pencil, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminUser = Readonly<{
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
  scheduleId: string | null;
  entryCount: number;
}>;

export function UserAdminRow({
  user,
  schedules,
  isCurrentUser,
}: Readonly<{
  user: AdminUser;
  schedules: readonly { id: string; name: string }[];
  isCurrentUser: boolean;
}>) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [scheduleId, setScheduleId] = useState(user.scheduleId ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");

  const scheduleName =
    schedules.find((schedule) => schedule.id === user.scheduleId)?.name ??
    "Sin horario";

  const request = async (
    method: "PATCH" | "DELETE",
    data?: Record<string, unknown>,
  ) => {
    setLoading(true);
    setMessage("");
    setMessageError(false);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "control-horas-pwa",
        },
        ...(data ? { body: JSON.stringify(data) } : {}),
      });
      if (!response.ok) {
        const body = (await response.json()) as {
          error?: { message?: string };
        };
        throw new Error(
          body.error?.message ?? "No se pudo completar la acción.",
        );
      }
      router.refresh();
      return true;
    } catch (error) {
      setMessageError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo completar la acción.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetDraft = () => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setStatus(user.status);
    setScheduleId(user.scheduleId ?? "");
  };

  return (
    <article className="px-5 py-5 sm:px-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold">{user.name}</p>
            {isCurrentUser ? (
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">
                Tu cuenta
              </span>
            ) : null}
            {user.status === "INACTIVE" ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                Inactivo
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            {user.role === "ADMIN" ? "Administrador" : scheduleName}
            {user.entryCount > 0
              ? ` · ${user.entryCount} ${user.entryCount === 1 ? "jornada" : "jornadas"}`
              : " · Sin jornadas"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="button-secondary"
            disabled={loading}
            onClick={() => {
              setEditOpen((value) => !value);
              setResetOpen(false);
              setDeleteOpen(false);
              setMessage("");
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar
          </button>
          {!isCurrentUser ? (
            <button
              type="button"
              className="button-secondary"
              disabled={loading}
              onClick={() => {
                setResetOpen((value) => !value);
                setEditOpen(false);
                setDeleteOpen(false);
                setMessage("");
              }}
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Contraseña
            </button>
          ) : null}
          {!isCurrentUser ? (
            <button
              type="button"
              className="button-danger"
              disabled={loading}
              onClick={() => {
                setDeleteOpen((value) => !value);
                setEditOpen(false);
                setResetOpen(false);
                setMessage("");
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Eliminar
            </button>
          ) : null}
        </div>
      </div>

      {isCurrentUser ? (
        <p className="mt-3 text-xs text-slate-500">
          Cambia tu propia contraseña desde “Mi perfil”.
        </p>
      ) : null}

      {editOpen ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="label" htmlFor={`name-${user.id}`}>
                Nombre
              </label>
              <input
                id={`name-${user.id}`}
                className="input"
                value={name}
                minLength={2}
                maxLength={150}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor={`email-${user.id}`}>
                Correo
              </label>
              <input
                id={`email-${user.id}`}
                className="input"
                type="email"
                value={email}
                maxLength={255}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor={`role-${user.id}`}>
                Rol
              </label>
              <select
                id={`role-${user.id}`}
                className="input"
                value={role}
                disabled={isCurrentUser}
                onChange={(event) => {
                  const nextRole = event.target.value as "ADMIN" | "USER";
                  setRole(nextRole);
                  if (nextRole === "ADMIN") setScheduleId("");
                }}
              >
                <option value="USER">Usuario</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor={`status-${user.id}`}>
                Estado
              </label>
              <select
                id={`status-${user.id}`}
                className="input"
                value={status}
                disabled={isCurrentUser}
                onChange={(event) =>
                  setStatus(event.target.value as "ACTIVE" | "INACTIVE")
                }
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
            {role === "USER" ? (
              <div className="md:col-span-2">
                <label className="label" htmlFor={`schedule-${user.id}`}>
                  Horario
                </label>
                <select
                  id={`schedule-${user.id}`}
                  className="input"
                  value={scheduleId}
                  onChange={(event) => setScheduleId(event.target.value)}
                >
                  <option value="">Selecciona un horario</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="button-primary"
              disabled={
                loading ||
                name.trim().length < 2 ||
                email.trim().length < 3 ||
                (role === "USER" && !scheduleId)
              }
              onClick={async () => {
                if (
                  await request("PATCH", {
                    name,
                    email,
                    role,
                    status,
                    scheduleId: role === "USER" ? scheduleId : null,
                  })
                ) {
                  setEditOpen(false);
                  setMessage("Usuario actualizado correctamente.");
                }
              }}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Guardar cambios
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={loading}
              onClick={() => {
                resetDraft();
                setEditOpen(false);
              }}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {resetOpen ? (
        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="label" htmlFor={`password-${user.id}`}>
              Nueva contraseña temporal para {user.name}
            </label>
            <input
              id={`password-${user.id}`}
              className="input"
              type="password"
              minLength={12}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 12 caracteres, mayúscula, minúscula y número"
            />
            <p className="mt-2 text-xs text-slate-500">
              Se cerrarán todas las sesiones abiertas de este usuario.
            </p>
          </div>
          <button
            type="button"
            className="button-primary"
            disabled={loading || password.length < 12}
            onClick={async () => {
              if (await request("PATCH", { password })) {
                setPassword("");
                setResetOpen(false);
                setMessage("Contraseña restablecida correctamente.");
              }
            }}
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Restablecer
          </button>
        </div>
      ) : null}

      {deleteOpen ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-900">
            ¿Eliminar definitivamente a {user.name}?
          </p>
          <p className="mt-2 text-sm leading-6 text-red-800">
            Se eliminarán su cuenta, sus sesiones, permisos y{" "}
            {user.entryCount === 0
              ? "los datos asociados."
              : `${user.entryCount} ${user.entryCount === 1 ? "jornada registrada" : "jornadas registradas"}.`}{" "}
            Esta acción no se puede deshacer.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="button-danger"
              disabled={loading}
              onClick={async () => {
                if (await request("DELETE")) {
                  setDeleteOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {loading ? "Eliminando…" : "Sí, eliminar usuario"}
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={loading}
              onClick={() => setDeleteOpen(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p
          className={`mt-3 text-sm ${
            messageError ? "text-red-700" : "text-teal-700"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </article>
  );
}
