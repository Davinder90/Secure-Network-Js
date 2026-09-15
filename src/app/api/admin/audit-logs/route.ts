import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { getAdminAuditLogs } from "@/src/lib/services/auditlog";
import UserModel, { UserRole } from "@/src/models/user.model";

export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;

  const adminId = (req as IAuthTokenRequest).user.id;
  const admin = await UserModel.findById(adminId).select("role");

  if (!admin || admin.role !== UserRole.Administrator) {
    return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "15", 10);

  return await getAdminAuditLogs(adminId, page, limit);
}
