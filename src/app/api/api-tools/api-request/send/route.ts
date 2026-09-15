import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { sendApi } from "@/src/lib/services/apis";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;
  const body = await req.json();
  return sendApi(body);
}
