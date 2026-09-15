import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import {
  createArticle,
  getArticlesFeed,
} from "@/src/lib/services/article";

/**
 * GET /api/articles?page=1&limit=6&tag=networking&query=dns
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "6", 10);
  const tag = searchParams.get("tag") || undefined;
  const category = searchParams.get("category") || undefined;
  const query = searchParams.get("query") || undefined;
  const authorId = searchParams.get("authorId") || undefined;

  return await getArticlesFeed({ page, limit, tag, category, query, authorId });
}

/**
 * POST /api/articles
 * Publishes a new article or saves a draft.
 */
export async function POST(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const body = await req.json();

  return await createArticle(userId, body);
}
