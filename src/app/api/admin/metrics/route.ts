import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { getAdminMetrics } from "@/src/lib/services/admin";
import UserModel, { UserRole } from "@/src/models/user.model";

export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req, "pass");
  if (authResponse) return authResponse;

  const adminId = (req as IAuthTokenRequest).user.id;
  const admin = await UserModel.findById(adminId).select("role");

  if (!admin || admin.role !== UserRole.Administrator) {
    return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), { status: 403 });
  }

  return await getAdminMetrics();
}
