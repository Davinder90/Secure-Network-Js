import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { deleteNotification } from "@/src/lib/services/notification";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/notifications/[id]
 * Deletes an individual notification by ID.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const authResponse = await authenticateToken(req, "articles");
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const { id } = await params;

  return await deleteNotification(userId, id);
}
