import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import {
  getArticleBySlugOrId,
  updateArticle,
  deleteArticle,
} from "@/src/lib/services/article";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/articles/[id]?mode=view
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const mode = (searchParams.get("mode") as "view" | "edit") || "view";

  return await getArticleBySlugOrId(id, mode);
}

/**
 * PUT /api/articles/[id]
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const { id } = await params;
  const body = await req.json();

  return await updateArticle(userId, id, body);
}

/**
 * DELETE /api/articles/[id]
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const { id } = await params;

  return await deleteArticle(userId, id);
}
