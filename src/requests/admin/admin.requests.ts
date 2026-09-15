import jsAxiosInstance from "@/src/lib/helpers/axios.helpers/js.axios.helpers";
import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper";
import { JS_SERVER_PATHS } from "@/src/lib/utils/constants";
import { AxiosResponse } from "axios";

/**
 * Fetches dashboard analytic KPIs.
 */
export const handleGetAdminMetrics = async () => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.ADMIN_METRICS)
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Fetches user accounts with optional status filtering.
 */
export const handleGetAdminUsers = async (status?: string) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.ADMIN_USERS, { params: { status } })
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Updates a user's privileges, status, or system scope.
 */
export const handleUpdateUserAccess = async (userId: string, updates: object) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.put(JS_SERVER_PATHS.ADMIN_USERS, { userId, ...updates })
  )) as AxiosResponse;
  return handleResponse(result);
};

/**
 * Retrieves paginated, sorted administrative system audit logs.
 */
export const handleGetAdminAuditLogs = async (page: number = 1, limit: number = 15) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.ADMIN_AUDIT_LOGS, { params: { page, limit } })
  )) as AxiosResponse;
  return handleResponse(result);
};
