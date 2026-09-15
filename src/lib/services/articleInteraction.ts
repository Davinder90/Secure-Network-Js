import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
  asyncRequestHandler,
  generateResponseObject,
} from "@helpers/common.helper";
import { IResponseObject } from "@/src/lib/interfaces/api.interfaces";
import NotificationModel, { NotificationType } from "@/src/models/notification.model";
import ArticleModel from "@/src/models/article.model"; 
import CommentModel from "@/src/models/comment.model";
import UserModel from "@/src/models/user.model";
import { dbConnection } from "@/src/config/dbConnection";
import { createNotification } from "@/src/lib/services/notification"; 
import { decryptId, encryptId } from "@/src/lib/helpers/crypto.helper"; 

/* -------------------------------------------------------------------------- */
/*                                    LIKES                                   */
/* -------------------------------------------------------------------------- */

/**
 * Checks if the current authenticated user has liked an article.
 * Accepts either an encrypted ID token, a raw ObjectId, or an article slug.
 */
export const checkIsArticleLiked = async (userId: string, articleIdOrToken: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      // 1. Resolve encrypted token or slug to MongoDB _id
      const decryptedId = decryptId(articleIdOrToken);
      const targetId = decryptedId || articleIdOrToken;

      let articleObjectId: mongoose.Types.ObjectId;

      if (mongoose.isValidObjectId(targetId)) {
        articleObjectId = new mongoose.Types.ObjectId(targetId);
      } else {
        const article = await ArticleModel.findOne({ articleId: targetId }).select("_id");
        if (!article) {
          return {
            error: "Article not found",
            status_code: StatusCodes.NOT_FOUND,
          };
        }
        articleObjectId = article._id as mongoose.Types.ObjectId;
      }

      const isLiked = await NotificationModel.exists({
        user: new mongoose.Types.ObjectId(userId),
        type: NotificationType.Like,
        article: articleObjectId,
      });

      return {
        message: "Like status retrieved",
        status_code: StatusCodes.OK,
        data: { isLiked: Boolean(isLiked) },
      };
    },
    "DATABASE_ERROR: Failed to check like status",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/**
 * Toggles like / unlike on an article and automatically delegates notification creation.
 * Accepts either an encrypted ID token, a raw ObjectId, or an article slug.
 */
export const toggleArticleLike = async (userId: string, articleIdOrToken: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      // 1. Resolve encrypted token or slug
      const decryptedId = decryptId(articleIdOrToken);
      const targetId = decryptedId || articleIdOrToken;

      const query = mongoose.isValidObjectId(targetId)
        ? { _id: new mongoose.Types.ObjectId(targetId) }
        : { articleId: targetId };

      const article = await ArticleModel.findOne(query);
      if (!article) {
        return {
          error: "Article not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      const existingLike = await NotificationModel.findOne({
        type: NotificationType.Like,
        article: article._id,
        user: new mongoose.Types.ObjectId(userId),
      });

      if (existingLike) {
        // Unlike action: decrement counters and delete notification
        await Promise.all([
          ArticleModel.findByIdAndUpdate(article._id, {
            $inc: { "activity.totalLikes": -1 },
          }),
          UserModel.findByIdAndUpdate(article.author, {
            $inc: { "articleStats.totalLikes": -1 },
          }),
          NotificationModel.findByIdAndDelete(existingLike._id),
        ]);

        return {
          message: "Article unliked successfully",
          status_code: StatusCodes.OK,
          data: { isLiked: false },
        };
      }

      // Like action: increment counters on article and author profile
      await Promise.all([
        ArticleModel.findByIdAndUpdate(article._id, {
          $inc: { "activity.totalLikes": 1 },
        }),
        UserModel.findByIdAndUpdate(article.author, {
          $inc: { "articleStats.totalLikes": 1 },
        }),
      ]);

      // Automatically delegate notification creation (handles self-like checks and deduplication)
      await createNotification({
        type: NotificationType.Like,
        articleId: article._id.toString(),
        recipientId: article.author.toString(),
        senderId: userId,
      });

      return {
        message: "Article liked successfully",
        status_code: StatusCodes.OK,
        data: { isLiked: true },
      };
    },
    "DATABASE_ERROR: Failed to update article like",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                                  COMMENTS                                  */
/* -------------------------------------------------------------------------- */

export interface IAddCommentPayload {
  articleId: string;
  comment: string;
  parentCommentId?: string;
  childrenLevel?: number;
}

/**
 * Adds a top-level comment or threaded reply and delegates notifications.
 */
export const addComment = async (
  userId: string,
  payload: IAddCommentPayload
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const { articleId, comment, parentCommentId, childrenLevel = 0 } = payload;

      if (!comment || comment.trim().length === 0) {
        return {
          error: "Comment cannot be empty",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      // 1. Resolve encrypted token or slug
      const decryptedArticleId = decryptId(articleId);
      const targetArticleId = decryptedArticleId || articleId;

      const query = mongoose.isValidObjectId(targetArticleId)
        ? { _id: new mongoose.Types.ObjectId(targetArticleId) }
        : { articleId: targetArticleId };

      const article = await ArticleModel.findOne(query);
      if (!article) {
        return {
          error: "Article not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      const isReply = Boolean(parentCommentId);

      const newComment = new CommentModel({
        article: article._id,
        articleAuthor: article.author,
        comment: comment.trim(),
        commentedBy: new mongoose.Types.ObjectId(userId),
        isReply,
        parent: parentCommentId && mongoose.isValidObjectId(parentCommentId)
          ? new mongoose.Types.ObjectId(parentCommentId)
          : null,
        childrenLevel,
      });

      const savedComment = await newComment.save();

      // Update Article activity comment counters
      await ArticleModel.findByIdAndUpdate(article._id, {
        $push: { comments: savedComment._id },
        $inc: {
          "activity.totalComments": 1,
          "activity.totalParentComments": isReply ? 0 : 1,
        },
      });

      // Delegate Notifications through createNotification
      if (isReply && parentCommentId) {
        const parentComment = await CommentModel.findByIdAndUpdate(
          parentCommentId,
          { $push: { children: savedComment._id } }
        );

        if (parentComment) {
          await createNotification({
            type: NotificationType.Reply,
            articleId: article._id.toString(),
            recipientId: parentComment.commentedBy.toString(),
            senderId: userId,
            commentId: savedComment._id.toString(),
            replyId: savedComment._id.toString(),
            repliedOnCommentId: parentComment._id.toString(),
          });
        }
      } else {
        await createNotification({
          type: NotificationType.Comment,
          articleId: article._id.toString(),
          recipientId: article.author.toString(),
          senderId: userId,
          commentId: savedComment._id.toString(),
        });
      }

      await savedComment.populate("commentedBy", "name username avatar");

      return {
        message: "Comment posted successfully",
        status_code: StatusCodes.CREATED,
        data: savedComment,
      };
    },
    "DATABASE_ERROR: Failed to post comment",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                               GET COMMENTS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fetches top-level parent comments for an article with pagination.
 */
export const getArticleComments = async (
  articleIdOrToken: string,
  skip: number = 0,
  limit: number = 5
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      // 1. Resolve encrypted token or slug
      const decryptedId = decryptId(articleIdOrToken);
      const targetId = decryptedId || articleIdOrToken;

      let articleObjectId: mongoose.Types.ObjectId;

      if (mongoose.isValidObjectId(targetId)) {
        articleObjectId = new mongoose.Types.ObjectId(targetId);
      } else {
        const article = await ArticleModel.findOne({ articleId: targetId }).select("_id");
        if (!article) {
          return {
            error: "Article not found",
            status_code: StatusCodes.NOT_FOUND,
          };
        }
        articleObjectId = article._id as mongoose.Types.ObjectId;
      }

      const comments = await CommentModel.find({
        article: articleObjectId,
        isReply: false,
      })
        .populate("commentedBy", "name username avatar")
        .skip(skip)
        .limit(limit)
        .sort({ commentedAt: -1 })
        .lean();

      return {
        message: "Comments fetched successfully",
        status_code: StatusCodes.OK,
        data: comments,
      };
    },
    "DATABASE_ERROR: Failed to fetch comments",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/**
 * Fetches threaded replies for a specific parent comment.
 */
export const getCommentReplies = async (
  commentId: string,
  skip: number = 0,
  limit: number = 5
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      if (!commentId || !mongoose.isValidObjectId(commentId)) {
        return {
          error: "Invalid comment ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const doc = await CommentModel.findById(commentId)
        .populate({
          path: "children",
          options: {
            skip,
            limit,
            sort: { commentedAt: -1 },
          },
          populate: {
            path: "commentedBy",
            select: "name username avatar",
          },
        })
        .select("children")
        .lean();

      return {
        message: "Replies fetched successfully",
        status_code: StatusCodes.OK,
        data: doc?.children || [],
      };
    },
    "DATABASE_ERROR: Failed to fetch replies",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                              DELETE COMMENTS                               */
/* -------------------------------------------------------------------------- */

/**
 * Deletes a comment and its nested child replies recursively.
 */
export const deleteComment = async (userId: string, commentId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      if (!commentId || !mongoose.isValidObjectId(commentId)) {
        return {
          error: "Invalid comment ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const comment = await CommentModel.findById(commentId);
      if (!comment) {
        return {
          error: "Comment not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      // Authorization check: User must be comment author or article author
      const isOwner = comment.commentedBy.toString() === userId.toString();
      const isArticleAuthor = comment.articleAuthor.toString() === userId.toString();

      if (!isOwner && !isArticleAuthor) {
        return {
          error: "Unauthorized to delete this comment",
          status_code: StatusCodes.FORBIDDEN,
        };
      }

      // Recursive deletion helper
      const recursiveDelete = async (id: mongoose.Types.ObjectId) => {
        const target = await CommentModel.findByIdAndDelete(id);
        if (!target) return;

        if (target.parent) {
          await CommentModel.findByIdAndUpdate(target.parent, {
            $pull: { children: id },
          });
        }

        await Promise.all([
          NotificationModel.deleteMany({ comment: id }),
          NotificationModel.deleteMany({ reply: id }),
          ArticleModel.findByIdAndUpdate(target.article, {
            $pull: { comments: id },
            $inc: {
              "activity.totalComments": -1,
              "activity.totalParentComments": target.isReply ? 0 : -1,
            },
          }),
        ]);

        if (target.children && target.children.length > 0) {
          for (const childId of target.children) {
            await recursiveDelete(childId);
          }
        }
      };

      await recursiveDelete(comment._id);

      return {
        message: "Comment and its replies deleted successfully",
        status_code: StatusCodes.OK,
        data: { id: commentId, deleted: true },
      };
    },
    "DATABASE_ERROR: Failed to delete comment",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};
