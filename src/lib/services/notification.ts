import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
  asyncRequestHandler,
  generateResponseObject,
} from "@helpers/common.helper";
import { IResponseObject } from "@/src/lib/interfaces/api.interfaces";
import NotificationModel, {
  INotificationModel,
  NotificationType,
} from "@/src/models/notification.model";
import UserModel from "@/src/models/user.model";
import ArticleModel from "@/src/models/article.model"; 
import CommentModel from "@/src/models/comment.model";
import { dbConnection } from "@/src/config/dbConnection";
import { encryptId, decryptId } from "@/src/lib/helpers/crypto.helper";

/* -------------------------------------------------------------------------- */
/*                                INTERFACES                                  */
/* -------------------------------------------------------------------------- */

export interface ICreateNotificationPayload {
  type: NotificationType;
  articleId: string;
  recipientId: string; // notificationFor
  senderId: string;    // user who triggered the event
  commentId?: string;
  replyId?: string;
  repliedOnCommentId?: string;
}

export interface IGetNotificationsQuery {
  page?: number;
  limit?: number;
  filterSeen?: boolean;
  type?: NotificationType;
}

/* -------------------------------------------------------------------------- */
/*                         FETCH USER NOTIFICATIONS                           */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves paginated notifications with populated metadata.
 * Strips raw MongoDB ObjectIds and replaces them with tamper-proof encrypted IDs.
 */
export const getUserNotifications = async (
  userId: string,
  options: IGetNotificationsQuery = {}
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      // 1. Resolve userId if passed as encrypted token
      const resolvedUserId = decryptId(userId) || userId;

      if (!resolvedUserId || !mongoose.isValidObjectId(resolvedUserId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const page = Math.max(1, Number(options.page) || 1);
      const limit = Math.max(1, Math.min(50, Number(options.limit) || 10));
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {
        notificationFor: new mongoose.Types.ObjectId(resolvedUserId),
      };

      if (options.filterSeen !== undefined) {
        filter.seen = options.filterSeen;
      }

      if (options.type && Object.values(NotificationType).includes(options.type)) {
        filter.type = options.type;
      }

      const [notifications, totalDocs, unreadCount] = await Promise.all([
        NotificationModel.find(filter)
          .populate({
            path: "user",
            model: UserModel,
            select: "name username avatar",
          })
          .populate({
            path: "article",
            model: ArticleModel,
            select: "title articleId banner",
          })
          .populate({
            path: "comment",
            model: CommentModel,
            select: "comment commentedAt",
          })
          .populate({
            path: "reply",
            model: CommentModel,
            select: "comment commentedAt",
          })
          .populate({
            path: "repliedOnComment",
            model: CommentModel,
            select: "comment",
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        NotificationModel.countDocuments(filter),
        NotificationModel.countDocuments({
          notificationFor: new mongoose.Types.ObjectId(resolvedUserId),
          seen: false,
        }),
      ]);

      // 🛡️ Map encrypted IDs to each item in the response
      const sanitizedNotifications = notifications.map((item: any) => {
        const { _id, article, ...rest } = item;
        return {
          ...rest,
          id: encryptId(_id),
          article: article
            ? {
                ...article,
                id: encryptId(article._id),
                _id: undefined,
              }
            : null,
        };
      });

      const totalPages = Math.ceil(totalDocs / limit);

      return {
        message: "Notifications fetched successfully",
        status_code: StatusCodes.OK,
        data: {
          notifications: sanitizedNotifications,
          pagination: {
            currentPage: page,
            totalPages,
            totalDocs,
            limit,
            hasMore: page < totalPages,
          },
          unreadCount,
        },
      };
    },
    "DATABASE_ERROR: Failed to fetch notifications",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                       UNREAD NOTIFICATIONS COUNT                           */
/* -------------------------------------------------------------------------- */

/**
 * Lightweight endpoint to query unread badge counts for navigation bars.
 */
export const getUnreadNotificationsCount = async (userId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const resolvedUserId = decryptId(userId) || userId;

      if (!resolvedUserId || !mongoose.isValidObjectId(resolvedUserId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const unreadCount = await NotificationModel.countDocuments({
        notificationFor: new mongoose.Types.ObjectId(resolvedUserId),
        seen: false,
      });

      return {
        message: "Unread count retrieved",
        status_code: StatusCodes.OK,
        data: { unreadCount, hasUnread: unreadCount > 0 },
      };
    },
    "DATABASE_ERROR: Failed to fetch unread count",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                       CREATE NOTIFICATION TRIGGER                          */
/* -------------------------------------------------------------------------- */

/**
 * Creates and saves an in-app notification event (skips self-notifications).
 * Automatically resolves incoming IDs whether raw ObjectIds or encrypted tokens.
 */
export const createNotification = async (
  payload: ICreateNotificationPayload
): Promise<INotificationModel | null> => {
  await dbConnection();

  const {
    type,
    articleId,
    recipientId,
    senderId,
    commentId,
    replyId,
    repliedOnCommentId,
  } = payload;

  // Resolve potential encrypted IDs
  const resolvedArticleId = decryptId(articleId) || articleId;
  const resolvedRecipientId = decryptId(recipientId) || recipientId;
  const resolvedSenderId = decryptId(senderId) || senderId;

  // Rule: Do not notify users about their own actions
  if (resolvedRecipientId.toString() === resolvedSenderId.toString()) {
    return null;
  }

  // Prevent duplicate like notifications
  if (type === NotificationType.Like) {
    const existingLike = await NotificationModel.findOne({
      type: NotificationType.Like,
      article: new mongoose.Types.ObjectId(resolvedArticleId),
      user: new mongoose.Types.ObjectId(resolvedSenderId),
    });
    if (existingLike) return existingLike;
  }

  const notification = new NotificationModel({
    type,
    article: new mongoose.Types.ObjectId(resolvedArticleId),
    notificationFor: new mongoose.Types.ObjectId(resolvedRecipientId),
    user: new mongoose.Types.ObjectId(resolvedSenderId),
    comment: commentId ? new mongoose.Types.ObjectId(decryptId(commentId) || commentId) : undefined,
    reply: replyId ? new mongoose.Types.ObjectId(decryptId(replyId) || replyId) : undefined,
    repliedOnComment: repliedOnCommentId
      ? new mongoose.Types.ObjectId(decryptId(repliedOnCommentId) || repliedOnCommentId)
      : undefined,
    seen: false,
  });

  return await notification.save();
};

/* -------------------------------------------------------------------------- */
/*                        MARK NOTIFICATIONS AS READ                          */
/* -------------------------------------------------------------------------- */

/**
 * Marks individual or all notifications as seen. Accepts encrypted notification IDs.
 */
export const markNotificationsAsRead = async (
  userId: string,
  notificationIds?: string[]
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const resolvedUserId = decryptId(userId) || userId;

      if (!resolvedUserId || !mongoose.isValidObjectId(resolvedUserId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const query: Record<string, unknown> = {
        notificationFor: new mongoose.Types.ObjectId(resolvedUserId),
        seen: false,
      };

      if (notificationIds && notificationIds.length > 0) {
        // 🛡️ Decrypt incoming IDs if they were encrypted on the client
        const validIds = notificationIds
          .map((id) => decryptId(id) || id)
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => new mongoose.Types.ObjectId(id));

        if (validIds.length > 0) {
          query._id = { $in: validIds };
        }
      }

      const updateResult = await NotificationModel.updateMany(query, {
        $set: { seen: true },
      });

      return {
        message: "Notifications marked as read",
        status_code: StatusCodes.OK,
        data: {
          modifiedCount: updateResult.modifiedCount,
          success: true,
        },
      };
    },
    "DATABASE_ERROR: Failed to update notifications",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                           DELETE NOTIFICATIONS                             */
/* -------------------------------------------------------------------------- */

/**
 * Deletes a single notification. Accepts an encrypted notification ID or raw ObjectId.
 */
export const deleteNotification = async (
  userId: string,
  notificationIdOrToken: string
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const resolvedUserId = decryptId(userId) || userId;
      const resolvedNotificationId = decryptId(notificationIdOrToken) || notificationIdOrToken;

      if (!resolvedUserId || !mongoose.isValidObjectId(resolvedUserId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      if (!resolvedNotificationId || !mongoose.isValidObjectId(resolvedNotificationId)) {
        return {
          error: "Invalid notification ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const deleted = await NotificationModel.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(resolvedNotificationId),
        notificationFor: new mongoose.Types.ObjectId(resolvedUserId),
      });

      if (!deleted) {
        return {
          error: "Notification not found or access denied",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      return {
        message: "Notification deleted successfully",
        status_code: StatusCodes.OK,
        data: { id: encryptId(deleted._id), deleted: true },
      };
    },
    "DATABASE_ERROR: Failed to delete notification",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/**
 * Purges all read notifications for a user to maintain clean storage.
 */
export const clearReadNotifications = async (userId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const resolvedUserId = decryptId(userId) || userId;

      if (!resolvedUserId || !mongoose.isValidObjectId(resolvedUserId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const purgeResult = await NotificationModel.deleteMany({
        notificationFor: new mongoose.Types.ObjectId(resolvedUserId),
        seen: true,
      });

      return {
        message: "Cleared all read notifications",
        status_code: StatusCodes.OK,
        data: { deletedCount: purgeResult.deletedCount },
      };
    },
    "DATABASE_ERROR: Failed to clear notifications",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};
