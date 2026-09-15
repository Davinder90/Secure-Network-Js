import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { deleteCategory } from "@/src/lib/services/category";
import UserModel, { UserRole } from "@/src/models/user.model";

/**
 * DELETE /api/category/delete?id=<categoryId>&soft=true&force=false
 */
export async function DELETE(req: NextRequest) {
  // 1. Authenticate user
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const user = await UserModel.findById(userId).select("role");

  // 2. Authorize administrator privilege
  if (!user || user.role !== UserRole.Administrator) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Administrator permissions required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Extract id & options from searchParams (No { params } in static routes)
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  const softDelete = searchParams.get("soft") === "true";
  const forceDelete = searchParams.get("force") === "true";

  return await deleteCategory(id, { softDelete, forceDelete });
}
