import { redirect } from "next/navigation";

import { getCurrentSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getCurrentSession();
  redirect(session ? "/dashboard" : "/login");
}
