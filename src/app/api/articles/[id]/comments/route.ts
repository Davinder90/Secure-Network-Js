import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import {
  addComment,
  getArticleComments,
  deleteComment,
} from "@/src/lib/services/articleInteraction";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/articles/[id]/comments?skip=0&limit=5
 * Fetches top-level parent comments for an article.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);

  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  return await getArticleComments(id, skip, limit);
}

/**
 * POST /api/articles/[id]/comments
 * Body: { comment: string, parentCommentId?: string, childrenLevel?: number }
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const authResponse = await authenticateToken(req, "articles");
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const { id } = await params;
  const body = await req.json();

  return await addComment(userId, {
    articleId: id,
    comment: body.comment,
    parentCommentId: body.parentCommentId,
    childrenLevel: body.childrenLevel || 0,
  });
}

/**
 * DELETE /api/articles/[id]/comments?commentId=...
 * Recursively deletes a comment and its child replies.
 */
export async function DELETE(req: NextRequest) {
  const authResponse = await authenticateToken(req, "articles");
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get("commentId");

  return await deleteComment(userId, commentId || "");
}
