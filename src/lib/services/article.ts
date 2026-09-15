import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
  asyncRequestHandler,
  generateResponseObject,
} from "@helpers/common.helper";
import { IResponseObject } from "@/src/lib/interfaces/api.interfaces";
import ArticleModel from "@/src/models/article.model";
import UserModel from "@/src/models/user.model";
import CommentModel from "@/src/models/comment.model";
import NotificationModel from "@/src/models/notification.model";
import CategoryModel from "@/src/models/category.model";
import { dbConnection } from "@/src/config/dbConnection";
import { encryptId, decryptId } from "@/src/lib/helpers/crypto.helper";
import { getImage } from "../helpers/file.helpers";

/* -------------------------------------------------------------------------- */
/*                                INTERFACES                                  */
/* -------------------------------------------------------------------------- */

export interface ICreateArticlePayload {
  title: string;
  description?: string;
  banner?: string;
  content: unknown[];
  tags?: string[];
  category?: string; // Category ObjectId
  draft?: boolean;
}

export interface IUpdateArticlePayload extends Partial<ICreateArticlePayload> {
  articleId?: string;
}

export interface IArticleFeedQuery {
  page?: number;
  limit?: number;
  tag?: string;
  category?: string;
  query?: string;
  authorId?: string;
  draft?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                            HELPER: SLUG CREATOR                            */
/* -------------------------------------------------------------------------- */

const generateUniqueSlug = async (title: string): Promise<string> => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const slug = `${baseSlug}-${randomSuffix}`;

  const exists = await ArticleModel.exists({ articleId: slug });
  if (exists) return generateUniqueSlug(title);

  return slug;
};

/* -------------------------------------------------------------------------- */
/*                        CREATE / PUBLISH ARTICLE                            */
/* -------------------------------------------------------------------------- */

/**
 * Creates a new article or saves a draft. Returns encrypted ID for the frontend.
 */
export const createArticle = async (
  userId: string,
  payload: ICreateArticlePayload
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const { title, description, banner, content, tags, category, draft = false } = payload;

      if (!title || title.trim().length < 3) {
        return {
          error: "Article title must be at least 3 characters long",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      if (!draft) {
        if (!content || !Array.isArray(content) || content.length === 0) {
          return {
            error: "Content is required to publish an article",
            status_code: StatusCodes.BAD_REQUEST,
          };
        }
      }

      const articleId = await generateUniqueSlug(title);
      const normalizedTags = (tags || []).map((t) => t.trim().toLowerCase());

      const article = new ArticleModel({
        articleId,
        title: title.trim(),
        description: description?.trim() || "",
        banner: banner?.trim() || "",
        content: content || [],
        tags: normalizedTags,
        category: category && mongoose.isValidObjectId(category) ? category : undefined,
        author: new mongoose.Types.ObjectId(userId),
        draft: Boolean(draft),
      });

      await article.save();

      // Synchronize Author Profile & Categories
      await Promise.all([
        UserModel.findByIdAndUpdate(userId, {
          $push: { articles: article._id },
          $inc: { "articleStats.totalArticles": draft ? 0 : 1 },
        }),
        category && mongoose.isValidObjectId(category)
          ? CategoryModel.findByIdAndUpdate(category, { $inc: { articleCount: draft ? 0 : 1 } })
          : Promise.resolve(),
      ]);

      return {
        message: draft ? "Draft saved successfully" : "Article published successfully",
        status_code: StatusCodes.CREATED,
        data: {
          // 🛡️ Encrypted identifier provided to client (never raw _id)
          id: encryptId(article._id),
          articleId: article.articleId,
          title: article.title,
          draft: article.draft,
          publishedAt: article.publishedAt,
        },
      };
    },
    "DATABASE_ERROR: Failed to create article",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                            UPDATE ARTICLE                                  */
/* -------------------------------------------------------------------------- */

/**
 * Updates an article. Accepts either an encrypted ID token or an article slug.
 */
export const updateArticle = async (
  userId: string,
  slugOrEncryptedId: string,
  payload: IUpdateArticlePayload
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      // 1. Decrypt token or resolve by slug
      const decryptedDocId = decryptId(slugOrEncryptedId);
      const isObjectId = mongoose.isValidObjectId(decryptedDocId || slugOrEncryptedId);

      const query = isObjectId
        ? { _id: new mongoose.Types.ObjectId(decryptedDocId || slugOrEncryptedId) }
        : { articleId: slugOrEncryptedId };

      const article = await ArticleModel.findOne(query);
      if (!article) {
        return {
          error: "Article not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      if (article.author.toString() !== userId.toString()) {
        return {
          error: "Unauthorized: You can only edit your own articles",
          status_code: StatusCodes.FORBIDDEN,
        };
      }

      const wasDraft = article.draft;
      const isNowPublished = payload.draft === false && wasDraft;

      // Apply Updates
      if (payload.title) article.title = payload.title.trim();
      if (payload.description !== undefined) article.description = payload.description.trim();
      if (payload.banner !== undefined) article.banner = payload.banner.trim();
      if (payload.content) article.content = payload.content;
      if (payload.tags) article.tags = payload.tags.map((t) => t.trim().toLowerCase());
      if (payload.category !== undefined) {
        article.category = mongoose.isValidObjectId(payload.category)
          ? new mongoose.Types.ObjectId(payload.category)
          : undefined;
      }
      if (payload.draft !== undefined) article.draft = Boolean(payload.draft);

      await article.save();

      // If transitioning from draft -> published, increment post counts
      if (isNowPublished) {
        await UserModel.findByIdAndUpdate(userId, {
          $inc: { "articleStats.totalArticles": 1 },
        });
        if (article.category) {
          await CategoryModel.findByIdAndUpdate(article.category, {
            $inc: { articleCount: 1 },
          });
        }
      }

      // Convert to plain object and replace _id with encrypted ID
      const articleObj = article.toObject();
      const sanitizedArticle = {
        ...articleObj,
        id: encryptId(article._id),
      };
      delete (sanitizedArticle as any)._id;

      return {
        message: "Article updated successfully",
        status_code: StatusCodes.OK,
        data: sanitizedArticle,
      };
    },
    "DATABASE_ERROR: Failed to update article",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                       FETCH ARTICLES FEED & SEARCH                         */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves paginated articles with tag filtering, search, and author info.
 * Maps encryptedId onto every record so database ObjectIds remain hidden.
 */
export const getArticlesFeed = async (options: IArticleFeedQuery = {}) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const page = Math.max(1, Number(options.page) || 1);
      const limit = Math.max(1, Math.min(30, Number(options.limit) || 6));
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {
        draft: options.draft !== undefined ? options.draft : false,
      };

      // Tag Filter
      if (options.tag) {
        filter.tags = options.tag.trim().toLowerCase();
      }

      // Category Filter
      if (options.category && mongoose.isValidObjectId(options.category)) {
        filter.category = new mongoose.Types.ObjectId(options.category);
      }

      // Author Filter (Handles encrypted ID token or raw ObjectId)
      if (options.authorId) {
        const decryptedAuthorId = decryptId(options.authorId) || options.authorId;
        if (mongoose.isValidObjectId(decryptedAuthorId)) {
          filter.author = new mongoose.Types.ObjectId(decryptedAuthorId);
        }
      }

      // Keyword Search
      if (options.query && options.query.trim()) {
        const regex = new RegExp(options.query.trim(), "i");
        filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
      }

      const [articles, totalDocs] = await Promise.all([
        ArticleModel.find(filter)
          .populate({
            path: "author",
            model: UserModel,
            select: "name username avatar jobTitle",
          })
          .populate({
            path: "category",
            model: CategoryModel,
            select: "name slug icon",
          })
          .select("articleId title description banner tags activity publishedAt author category draft")
          .sort({ isFeatured: -1, publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ArticleModel.countDocuments(filter),
      ]);

      // 🛡️ Map encrypted IDs to each item in the feed
      const sanitizedArticles = articles.map((art: any) => {
        const encrypted = encryptId(art._id);
        const { _id, ...rest } = art;
        return {
          ...rest,
          id: encrypted,
        };
      });

      const totalPages = Math.ceil(totalDocs / limit);

      return {
        message: "Articles feed fetched successfully",
        status_code: StatusCodes.OK,
        data: {
          articles: sanitizedArticles,
          pagination: {
            currentPage: page,
            totalPages,
            totalDocs,
            limit,
            hasMore: page < totalPages,
          },
        },
      };
    },
    "DATABASE_ERROR: Failed to fetch articles feed",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                        FETCH TRENDING ARTICLES                             */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves top ranked articles based on total reads and appreciations with encrypted ID.
 */
export const getTrendingArticles = async (limit: number = 5) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const articles = await ArticleModel.find({ draft: false })
        .populate({
          path: "author",
          model: UserModel,
          select: "name username avatar",
        })
        .select("articleId title banner activity publishedAt author")
        .sort({ "activity.totalReads": -1, "activity.totalLikes": -1, publishedAt: -1 })
        .limit(Math.max(1, Math.min(20, limit)))
        .lean();

      // 🛡️ Map encrypted IDs for trending rankings
      const sanitizedTrending = articles.map((art: any) => {
        const encrypted = encryptId(art._id);
        const { _id, ...rest } = art;
        return {
          ...rest,
          id: encrypted,
        };
      });

      return {
        message: "Trending articles fetched successfully",
        status_code: StatusCodes.OK,
        data: sanitizedTrending,
      };
    },
    "DATABASE_ERROR: Failed to fetch trending articles",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                     GET SINGLE ARTICLE (READER VIEW)                       */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves full article details for reader view and increments read count.
 * Seamlessly resolves either an encrypted token or a public slug.
 */
export const getArticleBySlugOrId = async (
  slugOrEncryptedId: string,
  mode: "view" | "edit" = "view"
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      // 1. Decrypt token or resolve by slug
      const decryptedDocId = decryptId(slugOrEncryptedId);
      const isObjectId = mongoose.isValidObjectId(decryptedDocId || slugOrEncryptedId);

      const query = isObjectId
        ? { _id: new mongoose.Types.ObjectId(decryptedDocId || slugOrEncryptedId) }
        : { articleId: slugOrEncryptedId };

      const article = await ArticleModel.findOne(query)
        .populate({
          path: "author",
          model: UserModel,
          select: "name username avatar bio jobTitle socialLinks articleStats",
        })
        .populate({
          path: "category",
          model: CategoryModel,
          select: "name slug",
        });

      if (!article) {
        return {
          error: "Article not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      // Increment read counter on public viewing
      if (mode === "view" && !article.draft) {
        await Promise.all([
          ArticleModel.findByIdAndUpdate(article._id, {
            $inc: { "activity.totalReads": 1 },
          }),
          UserModel.findByIdAndUpdate(article.author._id, {
            $inc: { "articleStats.totalReads": 1 },
          }),
        ]);
        article.activity.totalReads += 1;
      }

      // 🛡️ Convert to object, attach encrypted ID, and remove raw _id
      const articleObj = article.toObject();
      const sanitizedArticle = {
        ...articleObj,
        id: encryptId(article._id),
      };
      delete (sanitizedArticle as any)._id;

      return {
        message: "Article retrieved successfully",
        status_code: StatusCodes.OK,
        data: sanitizedArticle,
      };
    },
    "DATABASE_ERROR: Failed to retrieve article",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                            DELETE ARTICLE                                  */
/* -------------------------------------------------------------------------- */

/**
 * Permanently removes an article and cascades deletions across comments,
 * notifications, and user author statistics. Resolves encrypted IDs safely.
 */
export const deleteArticle = async (userId: string, slugOrEncryptedId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      // 1. Decrypt token or resolve by slug
      const decryptedDocId = decryptId(slugOrEncryptedId);
      const isObjectId = mongoose.isValidObjectId(decryptedDocId || slugOrEncryptedId);

      const query = isObjectId
        ? { _id: new mongoose.Types.ObjectId(decryptedDocId || slugOrEncryptedId) }
        : { articleId: slugOrEncryptedId };

      const article = await ArticleModel.findOne(query);
      if (!article) {
        return {
          error: "Article not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      // Check author authorization
      if (article.author.toString() !== userId.toString()) {
        const user = await UserModel.findById(userId).select("role");
        if (user?.role !== "administrator") {
          return {
            error: "Unauthorized to delete this article",
            status_code: StatusCodes.FORBIDDEN,
          };
        }
      }

      // Cascading cleanups
      await Promise.all([
        ArticleModel.findByIdAndDelete(article._id),
        CommentModel.deleteMany({ article: article._id }),
        NotificationModel.deleteMany({ article: article._id }),
        UserModel.findByIdAndUpdate(article.author, {
          $pull: { articles: article._id },
          $inc: {
            "articleStats.totalArticles": article.draft ? 0 : -1,
            "articleStats.totalLikes": -article.activity.totalLikes,
          },
        }),
        article.category
          ? CategoryModel.findByIdAndUpdate(article.category, {
              $inc: { articleCount: article.draft ? 0 : -1 },
            })
          : Promise.resolve(),
      ]);

      return {
        message: "Article and associated data deleted successfully",
        status_code: StatusCodes.OK,
        data: { id: encryptId(article._id), deleted: true },
      };
    },
    "DATABASE_ERROR: Failed to delete article",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};
