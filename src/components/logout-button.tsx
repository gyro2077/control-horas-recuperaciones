"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900"
      aria-label="Cerrar sesión"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: { "X-Requested-With": "control-horas-pwa" },
          });
        } finally {
          window.location.assign("/login");
        }
      }}
    >
      <LogOut className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
