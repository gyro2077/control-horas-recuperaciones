import type { Metadata, Viewport } from "next";

import { OnlineStatus } from "@/components/pwa/online-status";
import { PwaRegister } from "@/components/pwa/pwa-register";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Control de Horas",
    template: "%s | Control de Horas",
  },
  description:
    "Registra tu jornada y entiende tus horas pendientes y recuperadas.",
  applicationName: "Control de Horas y Recuperaciones",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Control de Horas",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <OnlineStatus />
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
