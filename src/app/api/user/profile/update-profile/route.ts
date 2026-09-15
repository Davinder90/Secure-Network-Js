import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { updateMyProfile } from "@services/user";

export async function PUT(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;
  const userId = (req as IAuthTokenRequest).user.id;
  const body = await req.json();
  return await updateMyProfile(userId, body);
}
