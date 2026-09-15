import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { updateCategory } from "@/src/lib/services/category";
import UserModel, { UserRole } from "@/src/models/user.model";

/**
 * PATCH /api/category/update
 * Body: { id: string, name?: string, description?: string, icon?: string, isFeatured?: boolean, isActive?: boolean }
 */
export async function PATCH(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const user = await UserModel.findById(userId).select("role");

  if (!user || user.role !== UserRole.Administrator) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Administrator permissions required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.json();
  const { id, ...updateData } = body;

  return await updateCategory(id, updateData);
}
