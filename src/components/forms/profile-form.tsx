"use client";

import { KeyRound, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileUser = Readonly<{
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  timezone: string;
  scheduleName: string | null;
}>;

async function responseMessage(response: Response, fallback: string) {
  const body = (await response.json()) as {
    error?: { message?: string };
  };
  return body.error?.message ?? fallback;
}

export function ProfileForm({ user }: Readonly<{ user: ProfileUser }>) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="card p-5 sm:p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setProfileLoading(true);
          setProfileMessage("");
          setProfileError(false);
          try {
            const response = await fetch("/api/profile", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "control-horas-pwa",
              },
              body: JSON.stringify({ name, email }),
            });
            if (!response.ok) {
              throw new Error(
                await responseMessage(
                  response,
                  "No se pudo actualizar el perfil.",
                ),
              );
            }
            setProfileMessage("Tu perfil se actualizó correctamente.");
            router.refresh();
          } catch (error) {
            setProfileError(true);
            setProfileMessage(
              error instanceof Error
                ? error.message
                : "No se pudo actualizar el perfil.",
            );
          } finally {
            setProfileLoading(false);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-100 text-teal-800">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-teal-700">Datos personales</p>
            <h2 className="text-xl font-semibold">Editar mi perfil</h2>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="profile-name">
              Nombre
            </label>
            <input
              id="profile-name"
              className="input"
              value={name}
              minLength={2}
              maxLength={150}
              autoComplete="name"
              required
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="profile-email">
              Correo
            </label>
            <input
              id="profile-email"
              className="input"
              value={email}
              type="email"
              maxLength={255}
              autoComplete="email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Tipo de cuenta</dt>
              <dd className="mt-1 font-semibold">
                {user.role === "ADMIN" ? "Administrador" : "Usuario"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Horario asignado</dt>
              <dd className="mt-1 font-semibold">
                {user.scheduleName ?? "No aplica"}
              </dd>
            </div>
          </dl>
        </div>

        {profileMessage ? (
          <p
            className={`mt-4 text-sm ${
              profileError ? "text-red-700" : "text-teal-700"
            }`}
            role="status"
          >
            {profileMessage}
          </p>
        ) : null}
        <button
          type="submit"
          className="button-primary mt-5 w-full sm:w-auto"
          disabled={
            profileLoading || name.trim().length < 2 || email.trim().length < 3
          }
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {profileLoading ? "Guardando…" : "Guardar perfil"}
        </button>
      </form>

      <form
        className="card p-5 sm:p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setPasswordLoading(true);
          setPasswordMessage("");
          setPasswordError(false);
          try {
            const response = await fetch("/api/profile/password", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "control-horas-pwa",
              },
              body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword,
              }),
            });
            if (!response.ok) {
              throw new Error(
                await responseMessage(
                  response,
                  "No se pudo cambiar la contraseña.",
                ),
              );
            }
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMessage("Tu contraseña se cambió correctamente.");
          } catch (error) {
            setPasswordError(true);
            setPasswordMessage(
              error instanceof Error
                ? error.message
                : "No se pudo cambiar la contraseña.",
            );
          } finally {
            setPasswordLoading(false);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-800">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-amber-700">Seguridad</p>
            <h2 className="text-xl font-semibold">Cambiar contraseña</h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Usa al menos 12 caracteres, una mayúscula, una minúscula y un número.
          Las demás sesiones abiertas se cerrarán.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="current-password">
              Contraseña actual
            </label>
            <input
              id="current-password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              required
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="new-password">
              Nueva contraseña
            </label>
            <input
              id="new-password"
              className="input"
              type="password"
              autoComplete="new-password"
              minLength={12}
              value={newPassword}
              required
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm-password">
              Repite la nueva contraseña
            </label>
            <input
              id="confirm-password"
              className="input"
              type="password"
              autoComplete="new-password"
              minLength={12}
              value={confirmPassword}
              required
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>

        {passwordMessage ? (
          <p
            className={`mt-4 text-sm ${
              passwordError ? "text-red-700" : "text-teal-700"
            }`}
            role="status"
          >
            {passwordMessage}
          </p>
        ) : null}
        <button
          type="submit"
          className="button-primary mt-5 w-full sm:w-auto"
          disabled={
            passwordLoading ||
            currentPassword.length === 0 ||
            newPassword.length < 12 ||
            newPassword !== confirmPassword
          }
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          {passwordLoading ? "Cambiando…" : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
