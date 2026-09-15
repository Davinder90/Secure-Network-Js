import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import {
  toggleArticleLike,
  checkIsArticleLiked,
} from "@/src/lib/services/articleInteraction";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/articles/[id]/like
 * Checks if current user has liked this article.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const { id } = await params;

  return await checkIsArticleLiked(userId, id);
}

/**
 * POST /api/articles/[id]/like
 * Toggles like / unlike on the article and sends notification to the author.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const { id } = await params;

  return await toggleArticleLike(userId, id);
}
