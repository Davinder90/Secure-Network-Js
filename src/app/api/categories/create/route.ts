import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import {
  createCategory,
  seedDefaultCategories,
} from "@/src/lib/services/category";
import UserModel, { UserRole } from "@/src/models/user.model";


/**
 * POST /api/categories
 * Admin-only endpoint to create a new category or trigger initial seeding.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate user
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const user = await UserModel.findById(userId).select("role");

  // 2. Authorize administrator privilege
  if (!user || user.role !== UserRole.Administrator) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Administrator access required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.json();

  // 3. Handle seed trigger or standard creation
  if (body?.action === "seed") {
    return await seedDefaultCategories();
  }

  return await createCategory(body);
}
