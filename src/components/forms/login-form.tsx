"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.email("Ingresa un correo válido."),
  password: z.string().min(8, "Ingresa tu contraseña."),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "control-horas-pwa",
        },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        setServerError(
          payload.error?.message ??
            "No pudimos iniciar sesión. Intenta nuevamente.",
        );
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setServerError(
        "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.",
      );
    }
  });

  return (
    <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
      {serverError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {serverError}
        </div>
      ) : null}
      <div>
        <label className="label" htmlFor="email">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="absolute top-3.5 left-3.5 h-5 w-5 text-slate-400"
          />
          <input
            {...register("email")}
            className="input pl-11"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            aria-invalid={Boolean(errors.email)}
          />
        </div>
        {errors.email ? (
          <p className="mt-1.5 text-sm text-red-700">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="label mb-0" htmlFor="password">
            Contraseña
          </label>
          <Link
            className="text-sm font-semibold text-teal-700 hover:underline"
            href="/recuperar"
          >
            ¿La olvidaste?
          </Link>
        </div>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute top-3.5 left-3.5 h-5 w-5 text-slate-400"
          />
          <input
            {...register("password")}
            className="input pr-11 pl-11"
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            aria-invalid={Boolean(errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="mt-1.5 text-sm text-red-700">
            {errors.password.message}
          </p>
        ) : null}
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
        <input
          {...register("remember")}
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 accent-teal-700"
        />
        Mantener sesión iniciada en este dispositivo
      </label>
      <button
        className="button-primary w-full"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : null}
        {isSubmitting ? "Ingresando…" : "Iniciar sesión"}
      </button>
      <p className="text-center text-xs leading-5 text-slate-500">
        Tus credenciales y datos de conexión nunca se guardan en este
        dispositivo.
      </p>
    </form>
  );
}
