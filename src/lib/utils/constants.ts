import path from "path";

export const COLORS = {
  RESET: "\x1b[0m",
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",
  WHITE: "\x1b[37m",
};

export const PYTHON_SERVER_PATHS = {
  "DNS_LOOKUP": `/api/dns-lookup/dig`,
  "IP_INFORMATION": `/api/dns-lookup/ip-information`,
  "DOMAIN_INFORMATION": "/api/dns-lookup/domain-information",
  "REVERSE_DNS": "/api/dns-lookup/reverse-dns",
  "TRACEROUTE": `/api/connectivity-reachability/traceroute`,
  "PING": `/api/connectivity-reachability/ping`,
  "SCAN_WELL_KNONW_PORTS": `/api/port-scanner/scan-well-known-ports`,
  "OPEN_PORT_CHECK": "/api/port-scanner/scan-ports"
}
export const JS_SERVER_PATHS = {
  // USER ENDPOINTS
  USER_REGISTER: '/user/auth/register',
  USER_LOGIN: '/user/auth/sign-in',
  USER_GET_ALLOWANCE: '/user/get-allowance',
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile/update-profile',
  CHANGE_PASSWORD: '/user/profile/change-password',

  // ADMIN ENDPOINTS
  IS_ADMIN: '/admin/is-admin',
  ADMIN_METRICS: '/admin/metrics',
  ADMIN_USERS: '/admin/users',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',

  // COLLECTION ENDPOINTS
  GET_COLLECTIONS: '/api-tools/collection/get',
  CREATE_COLLECTION: '/api-tools/collection/create',
  UPDATE_COLLECTION: '/api-tools/collection/update',
  DELETE_COLLECTION: '/api-tools/collection/delete',
  GET_COLLECTION_BY_ID: '/api-tools/collection/get-by-id',

  // API REQUEST ENDPOINTS
  GET_APIS: '/api-tools/api-request/get',
  CREATE_API: '/api-tools/api-request/create',
  UPDATE_API: '/api-tools/api-request/update',
  DELETE_API: '/api-tools/api-request/delete',
  GET_API_BY_ID: '/api-tools/api-request/get-by-id',
  CLONE_API: '/api-tools/api-request/clone',
  SEND_API: '/api-tools/api-request/send',

  // ARTICLE ENDPOINTS
  GET_ARTICLES: '/articles',
  CREATE_ARTICLE: '/articles',
  GET_TRENDING_ARTICLES: '/articles/trending',
  GET_ARTICLE_BY_ID: '/articles', // append /:id
  UPDATE_ARTICLE: '/articles',    // append /:id
  DELETE_ARTICLE: '/articles',    // append /:id

  // CATEGORY ENDPOINTS
  GET_CATEGORIES: '/categories/get',
  CREATE_CATEGORY: '/categories/create',
  UPDATE_CATEGORY: '/categories/update', // append /:id
  DELETE_CATEGORY: '/categories/delete', // append /:id

  // ARTICLE INTERACTIONS & COMMENTS
  CHECK_ARTICLE_LIKE: '/articles', // /articles/:id/like
  TOGGLE_ARTICLE_LIKE: '/articles', // /articles/:id/like
  GET_ARTICLE_COMMENTS: '/articles', // /articles/:id/comments
  ADD_ARTICLE_COMMENT: '/articles',  // /articles/:id/comments
  DELETE_ARTICLE_COMMENT: '/articles', // /articles/:id/comments?commentId=...
  GET_COMMENT_REPLIES: '/comments', // /comments/:id/replies
  UPLOAD_IMAGE: '/image/upload',
  REPLACE_IMAGE: '/image/update',
  GET_IMAGE: '/image/get',
  DELETE_IMAGE: '/image/delete',

  // NOTIFICATION ENDPOINTS
  GET_NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATIONS_READ: '/notifications',
  CLEAR_READ_NOTIFICATIONS: '/notifications',
  GET_UNREAD_NOTIFICATIONS_COUNT: '/notifications/unread-count',
  DELETE_NOTIFICATION: '/notifications', // append /:id
} as const;

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal server error, please try again later",
  INVALID_ROUTE: "Please enter the valid route",
};

const IS_LAMBDA = process.env.AWS_EXECUTION_ENV !== undefined;
const ROOT_DIRECTORY_PATH = process.cwd();
export const IMAGE_STORAGE_PATH = IS_LAMBDA
  ? path.join("/tmp", "ArticleImagesStorage")
  : path.join(ROOT_DIRECTORY_PATH, "src", "ArticleImagesStorage");

