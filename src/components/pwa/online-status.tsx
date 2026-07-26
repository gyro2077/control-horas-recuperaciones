"use client";

import { CloudOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;
  return (
    <div
      role="status"
      className="fixed top-3 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xl"
    >
      <CloudOff className="h-4 w-4" aria-hidden="true" />
      Sin conexión · vuelve a conectarte para registrar horas
    </div>
  );
}
