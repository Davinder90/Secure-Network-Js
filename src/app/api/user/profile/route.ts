import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { getMyProfile } from "@/src/lib/services/user";

export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;
  const userId = (req as IAuthTokenRequest).user.id;
  return await getMyProfile(userId);
}
