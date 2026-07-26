import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Control de Horas y Recuperaciones",
    short_name: "Control Horas",
    description: "Registra jornadas, permisos y comprende tu saldo de horas.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f4f7f6",
    theme_color: "#0f766e",
    orientation: "any",
    lang: "es-EC",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/app-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
