import { NextRequest } from "next/server";
import { getCommentReplies } from "@/src/lib/services/articleInteraction";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/comments/[id]/replies?skip=0&limit=5
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);

  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  return await getCommentReplies(id, skip, limit);
}
