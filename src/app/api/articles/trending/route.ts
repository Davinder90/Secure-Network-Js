import { NextRequest } from "next/server";
import { getTrendingArticles } from "@/src/lib/services/article";

/**
 * GET /api/articles/trending?limit=5
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  return await getTrendingArticles(limit);
}
