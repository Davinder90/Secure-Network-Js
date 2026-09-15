import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { getApis } from "@/src/lib/services/apis";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;
  const { searchParams } = req.nextUrl;
  const collectionId = searchParams.get("collectionId");
  const userId = (req as IAuthTokenRequest).user.id;
  return await getApis(collectionId || undefined, userId);
}