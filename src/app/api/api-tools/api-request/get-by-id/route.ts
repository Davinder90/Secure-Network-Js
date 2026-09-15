import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { getApiById } from "@/src/lib/services/apis";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;
  const { searchParams } = new URL(req.url);
  const apiId = searchParams.get("apiId") as string;
  const userId = (req as IAuthTokenRequest).user.id;
  return await getApiById(apiId, userId);
}