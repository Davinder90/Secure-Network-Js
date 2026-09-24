import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { updateCategory } from "@/src/lib/services/category";
import UserModel, { UserRole } from "@/src/models/user.model";

/**
 * PATCH /api/categories/update
 * Body payload: { id: string, name?: string, description?: string, icon?: string, isFeatured?: boolean, isActive?: boolean }
 */
export async function PATCH(req: NextRequest) {
  // 1. Authenticate token (verifying system-wide administrator role)
  const authResponse = await authenticateToken(req, "pass");
  if (authResponse) return authResponse;

  const adminId = (req as IAuthTokenRequest).user.id;
  const admin = await UserModel.findById(adminId).select("role");

  // 2. Authorize administrator privilege
  if (!admin || admin.role !== UserRole.Administrator) {
    return new Response(
      JSON.stringify({ error: "Forbidden: Administrator permissions required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Parse payload from request body
  const body = await req.json();
  const { id, ...updateData } = body;

  // 4. Delegate to update service
  return await updateCategory(id, updateData);
}
