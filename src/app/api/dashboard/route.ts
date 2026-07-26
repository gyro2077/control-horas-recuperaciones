import { requireSession } from "@/server/auth/session";
import { errorResponse, success } from "@/server/http";
import { getDashboard } from "@/server/services/balance-query-service";

export async function GET() {
  try {
    const session = await requireSession();
    const dashboard = await getDashboard(
      session.user.id,
      session.user.timezone,
    );
    return success({ dashboard });
  } catch (error) {
    return errorResponse(error);
  }
}
