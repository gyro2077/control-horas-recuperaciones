import { getCurrentSession } from "@/server/auth/session";
import { errorResponse, success } from "@/server/http";

export async function GET() {
  try {
    const session = await getCurrentSession();
    return success({ session });
  } catch (error) {
    return errorResponse(error);
  }
}
