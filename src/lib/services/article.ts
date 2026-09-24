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
 * Creates a new article or saves a draft, synchronizing author post counts and category metrics.
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

      const decryptCategoryId = decryptId(payload.category as string);
      const Category = decryptCategoryId && mongoose.isValidObjectId(decryptCategoryId)
        ? new mongoose.Types.ObjectId(decryptCategoryId)
        : undefined;

      const article = new ArticleModel({
        articleId,
        title: title.trim(),
        description: description?.trim() || "",
        banner: banner?.trim() || "",
        content: content || [],
        tags: normalizedTags,
        category: Category,
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
        category && mongoose.isValidObjectId(Category)
          ? CategoryModel.findByIdAndUpdate(Category, { $inc: { articleCount: draft ? 0 : 1 } })
          : Promise.resolve(),
      ]);

      return {
        message: draft ? "Draft saved successfully" : "Article published successfully",
        status_code: StatusCodes.CREATED,
        data: {
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
 * Updates an article. Recalculates category articleCount on publish/unpublish.
 */
export const updateArticle = async (
  userId: string,
  slugOrEncryptedId: string,
  payload: IUpdateArticlePayload
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
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
      const willBeDraft = payload.draft !== undefined ? Boolean(payload.draft) : wasDraft;

      const previousCategory = article.category;
      const decryptCategoryId = decryptId(payload.category as string);
      const nextCategory = decryptCategoryId && mongoose.isValidObjectId(decryptCategoryId)
        ? new mongoose.Types.ObjectId(decryptCategoryId)
        : undefined;

      // Apply Updates
      if (payload.title) article.title = payload.title.trim();
      if (payload.description !== undefined) article.description = payload.description.trim();
      if (payload.banner !== undefined) article.banner = payload.banner.trim();
      if (payload.content) article.content = payload.content;
      if (payload.tags) article.tags = payload.tags.map((t) => t.trim().toLowerCase());
      if (payload.category !== undefined) article.category = nextCategory;
      if (payload.draft !== undefined) article.draft = willBeDraft;

      await article.save();

      /* ------------------------------------------------------------------ */
      /*                  SYNCHRONIZE CATEGORIES & COUNTS                   */
      /* ------------------------------------------------------------------ */

      // Scenario A: Article transitions from Draft -> Published
      if (wasDraft && !willBeDraft) {
        await UserModel.findByIdAndUpdate(userId, { $inc: { "articleStats.totalArticles": 1 } });
        if (article.category) {
          await CategoryModel.findByIdAndUpdate(article.category, { $inc: { articleCount: 1 } });
        }
      }
      // Scenario B: Article transitions from Published -> Draft (Unpublished)
      else if (!wasDraft && willBeDraft) {
        await UserModel.findByIdAndUpdate(userId, { $inc: { "articleStats.totalArticles": -1 } });
        if (article.category) {
          await CategoryModel.findByIdAndUpdate(article.category, { $inc: { articleCount: -1 } });
        }
      }
      // Scenario C: Article category was changed while remaining published
      else if (!willBeDraft && previousCategory?.toString() !== nextCategory?.toString()) {
        if (previousCategory) {
          await CategoryModel.findByIdAndUpdate(previousCategory, { $inc: { articleCount: -1 } });
        }
        if (nextCategory) {
          await CategoryModel.findByIdAndUpdate(nextCategory, { $inc: { articleCount: 1 } });
        }
      } 

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

      if (options.tag) {
        filter.tags = options.tag.trim().toLowerCase();
      }

      if (options.category && mongoose.isValidObjectId(options.category)) {
        filter.category = new mongoose.Types.ObjectId(options.category);
      }

      if (options.authorId) {
        const decryptedAuthorId = decryptId(options.authorId) || options.authorId;
        if (mongoose.isValidObjectId(decryptedAuthorId)) {
          filter.author = new mongoose.Types.ObjectId(decryptedAuthorId);
        }
      }

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
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ArticleModel.countDocuments(filter),
      ]);

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

export const getArticleBySlugOrId = async (
  slugOrEncryptedId: string,
  mode: "view" | "edit" = "view"
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
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

      // Increment reads
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

export const deleteArticle = async (userId: string, slugOrEncryptedId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
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
        const user = await UserModel.findById(userId).select("role");
        if (user?.role !== "administrator") {
          return {
            error: "Unauthorized to delete this article",
            status_code: StatusCodes.FORBIDDEN,
          };
        }
      }

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
