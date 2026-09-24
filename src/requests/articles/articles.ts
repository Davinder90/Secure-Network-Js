import jsAxiosInstance from "@/src/lib/helpers/axios.helpers/js.axios.helpers";
import {
  asyncResponseHandler,
  handleResponse,
} from "@/src/lib/helpers/ui/common.helper";
import { JS_SERVER_PATHS } from "@/src/lib/utils/constants";
import { AxiosResponse } from "axios";

/* -------------------------------------------------------------------------- */
/*                               ARTICLES                                     */
/* -------------------------------------------------------------------------- */

/**
 * Fetches the paginated articles feed with optional filtering parameters.
 */
export const handleGetArticles = async (params?: {
  page?: number;
  limit?: number;
  tag?: string;
  category?: string;
  query?: string;
  authorId?: string;
}) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.GET_ARTICLES, { params })
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Fetches top trending articles based on views and likes.
 */
export const handleGetTrendingArticles = async (limit: number = 5) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.GET_TRENDING_ARTICLES, {
      params: { limit },
    })
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Fetches full article details for reader view or editor mode.
 */
export const handleGetArticleByIdOrSlug = async (
  idOrSlug: string,
  mode: "view" | "edit" = "view"
) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(`${JS_SERVER_PATHS.GET_ARTICLE_BY_ID}/${idOrSlug}`, {
      params: { mode },
    })
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Publishes a new article or saves a draft.
 */
export const handleCreateArticle = async (body: object) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.post(JS_SERVER_PATHS.CREATE_ARTICLE, body)
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Updates an existing article or changes draft status.
 */
export const handleUpdateArticle = async (
  idOrSlug: string,
  body: object
) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.put(`${JS_SERVER_PATHS.UPDATE_ARTICLE}/${idOrSlug}`, body)
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Permanently deletes an article and cascades deletions.
 */
export const handleDeleteArticle = async (idOrSlug: string) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.delete(`${JS_SERVER_PATHS.DELETE_ARTICLE}/${idOrSlug}`)
  )) as AxiosResponse;
  return handleResponse(result);
};

/* -------------------------------------------------------------------------- */
/*                               CATEGORIES                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fetches active categories for tags and filter strips.
 */
export const handleGetCategories = async (includeAll: boolean = false) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.GET_CATEGORIES, {
      params: { all: includeAll },
    })
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Admin action to create a new category or seed defaults.
 */
export const handleCreateCategory = async (body: object) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.post(JS_SERVER_PATHS.CREATE_CATEGORY, body)
  )) as AxiosResponse;
  return handleResponse(result);
};

export const handleUpdateCategory = async (id: string, data: object) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.patch(JS_SERVER_PATHS.UPDATE_CATEGORY, data = {id, ...data})
  )) as AxiosResponse;
  return handleResponse(result);
};

export const handleDeleteCategory = async (id: string) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.delete(JS_SERVER_PATHS.DELETE_CATEGORY, {data: {id}})
  )) as AxiosResponse;
  return handleResponse(result);
};

/* -------------------------------------------------------------------------- */
/*                            LIKES & INTERACTIONS                            */
/* -------------------------------------------------------------------------- */

/**
 * Checks if the current authenticated user has liked an article.
 */
export const handleCheckArticleLike = async (articleId: string) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(`${JS_SERVER_PATHS.CHECK_ARTICLE_LIKE}/${articleId}/like`)
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Toggles like / unlike on an article.
 */
export const handleToggleArticleLike = async (articleId: string) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.post(`${JS_SERVER_PATHS.TOGGLE_ARTICLE_LIKE}/${articleId}/like`)
  )) as AxiosResponse;
  return handleResponse(result);
};

/* -------------------------------------------------------------------------- */
/*                                 COMMENTS                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fetches top-level parent comments for an article.
 */
export const handleGetArticleComments = async (
  articleId: string,
  params?: { skip?: number; limit?: number }
) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(
      `${JS_SERVER_PATHS.GET_ARTICLE_COMMENTS}/${articleId}/comments`,
      { params }
    )
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Posts a top-level comment or threaded reply.
 */
export const handleAddArticleComment = async (
  articleId: string,
  body: { comment: string; parentCommentId?: string; childrenLevel?: number }
) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.post(
      `${JS_SERVER_PATHS.ADD_ARTICLE_COMMENT}/${articleId}/comments`,
      body
    )
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Deletes a comment and its child replies recursively.
 */
export const handleDeleteArticleComment = async (
  articleId: string,
  commentId: string
) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.delete(
      `${JS_SERVER_PATHS.DELETE_ARTICLE_COMMENT}/${articleId}/comments`,
      { params: { commentId } }
    )
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Fetches nested replies for a specific parent comment.
 */
export const handleGetCommentReplies = async (
  commentId: string,
  params?: { skip?: number; limit?: number }
) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(
      `${JS_SERVER_PATHS.GET_COMMENT_REPLIES}/${commentId}/replies`,
      { params }
    )
  )) as AxiosResponse;
  return handleResponse(result);
};

/* -------------------------------------------------------------------------- */
/*                              NOTIFICATIONS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves paginated notifications for the authenticated user.
 */
export const handleGetNotifications = async (params?: {
  page?: number;
  limit?: number;
  seen?: boolean;
  type?: string;
}) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.GET_NOTIFICATIONS, { params })
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Lightweight request to get the unread notifications count for the navbar badge.
 */
export const handleGetUnreadNotificationsCount = async () => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.GET_UNREAD_NOTIFICATIONS_COUNT)
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Marks individual or all notifications as seen.
 */
export const handleMarkNotificationsRead = async (notificationIds?: string[]) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.patch(JS_SERVER_PATHS.MARK_NOTIFICATIONS_READ, {
      notificationIds,
    })
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Clears/purges all read notifications for the current user.
 */
export const handleClearReadNotifications = async () => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.delete(JS_SERVER_PATHS.CLEAR_READ_NOTIFICATIONS)
  )) as AxiosResponse;
  return handleResponse(result);
};
