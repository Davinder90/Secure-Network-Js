import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { getMyProfile } from "@/src/lib/services/user";

/**
 * GET /api/user/profile?page=1&limit=5
 */
export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req, "pass");
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  return await getMyProfile(userId, page, limit);
}
