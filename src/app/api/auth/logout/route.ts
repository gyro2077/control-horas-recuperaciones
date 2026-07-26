import { destroyCurrentSession } from "@/server/auth/session";
import { assertTrustedMutation, errorResponse, success } from "@/server/http";

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    await destroyCurrentSession();
    return success({ loggedOut: true });
  } catch (error) {
    return errorResponse(error);
  }
}
