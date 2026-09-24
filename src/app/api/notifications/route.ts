import { NextRequest } from "next/server";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import {
  getUserNotifications,
  markNotificationsAsRead,
  clearReadNotifications,
} from "@/src/lib/services/notification";
import { NotificationType } from "@/src/models/notification.model";

/**
 * GET /api/notifications?page=1&limit=10&seen=false&type=like
 */
export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req, "articles");
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const filterSeen = searchParams.has("seen")
    ? searchParams.get("seen") === "true"
    : undefined;
  const type = (searchParams.get("type") as NotificationType) || undefined;

  return await getUserNotifications(userId, { page, limit, filterSeen, type });
}

/**
 * PATCH /api/notifications
 * Body: { notificationIds?: string[] }
 */
export async function PATCH(req: NextRequest) {
  const authResponse = await authenticateToken(req, "articles");
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  const body = await req.json().catch(() => ({}));

  return await markNotificationsAsRead(userId, body?.notificationIds);
}

/**
 * DELETE /api/notifications
 * Purges all read notifications for the authenticated user.
 */
export async function DELETE(req: NextRequest) {
  const authResponse = await authenticateToken(req, "articles");
  if (authResponse) return authResponse;

  const userId = (req as IAuthTokenRequest).user.id;
  return await clearReadNotifications(userId);
}
