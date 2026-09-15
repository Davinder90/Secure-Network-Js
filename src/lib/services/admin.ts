import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { asyncRequestHandler, generateResponseObject } from "@helpers/common.helper";
import { IResponseObject } from "@/src/lib/interfaces/api.interfaces";
import UserModel, { UserRole, UserAccountStatus } from "@/src/models/user.model";
import ArticleModel from "@/src/models/article.model";
import CategoryModel from "@/src/models/category.model";
import CommentModel from "@/src/models/comment.model";
import { dbConnection } from "@/src/config/dbConnection";
import { encryptId, decryptId } from "@/src/lib/helpers/crypto.helper";
import { createAuditTrace } from "./auditlog";
import { AuditAction } from "@/src/models/auditlog.model";

/* -------------------------------------------------------------------------- */
/*                         FETCH ADMIN CONSOLE OVERVIEW                       */
/* -------------------------------------------------------------------------- */

/**
 * Aggregates analytical KPIs across users, articles, categories, and reads.
 */
export const getAdminMetrics = async () => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const [totalUsers, pendingApprovals, totalArticles, totalCategories, totalComments] = await Promise.all([
        UserModel.countDocuments({}),
        UserModel.countDocuments({ status: UserAccountStatus.Pending }),
        ArticleModel.countDocuments({ draft: false }),
        CategoryModel.countDocuments({ isActive: true }),
        CommentModel.countDocuments({}),
      ]);

      // Aggregate platform-wide read counts
      const readMetrics = await UserModel.aggregate([
        { $group: { _id: null, totalReads: { $sum: "$articleStats.totalReads" } } }
      ]);
      const totalReads = readMetrics[0]?.totalReads || 0;

      return {
        message: "Analytics aggregated successfully",
        status_code: StatusCodes.OK,
        data: {
          totalUsers,
          pendingApprovals,
          totalArticles,
          totalCategories,
          totalComments,
          totalReads,
        },
      };
    },
    "DATABASE_ERROR: Failed to aggregate metrics",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                         FETCH ALL USER ACCOUNTS                            */
/* -------------------------------------------------------------------------- */

/**
 * Returns a list of users (excluding password hashes) with option to filter by status.
 */
export const getAdminUserAccounts = async (statusFilter?: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const query: Record<string, unknown> = {};
      if (statusFilter && Object.values(UserAccountStatus).includes(statusFilter as UserAccountStatus)) {
        query.status = statusFilter;
      }

      const users = await UserModel.find(query).select("-password").sort({ createdAt: -1 }).lean();

      const sanitizedUsers = users.map((u: any) => ({
        ...u,
        id: encryptId(u._id),
        _id: encryptId(u._id),
      }));

      return {
        message: "User accounts retrieved successfully",
        status_code: StatusCodes.OK,
        data: sanitizedUsers,
      };
    },
    "DATABASE_ERROR: Failed to retrieve user accounts",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                       TOGGLE USER ALLOWANCE STATUS                         */
/* -------------------------------------------------------------------------- */

/**
 * Modifies isAllowed status, role, or product module checkboxes on a user's account.
 */
export const updateAdminUserAccess = async (
  adminId: string,
  targetUserIdOrToken: string,
  updates: {
    status?: UserAccountStatus;
    isAllowed?: boolean;
    role?: UserRole;
    productAccess?: {
      networking: boolean;
      security: boolean;
      api: boolean;
      articles: boolean;
      cloud: boolean;
    };
  }
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const decryptedUserId = decryptId(targetUserIdOrToken);
      const targetUserId = decryptedUserId || targetUserIdOrToken;

      if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      if (targetUserId.toString() === adminId.toString()) {
        return {
          error: "Self-modification: You cannot revoke your own administrator privileges",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const user = await UserModel.findById(targetUserId).select("-password");
      if (!user) {
        return {
          error: "User account not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      // Track details for the tamper-proof Audit Trail
      const auditDetails: Record<string, any> = {};

      if (updates.status && updates.status !== user.status) {
        auditDetails.previousStatus = user.status;
        auditDetails.newStatus = updates.status;
        user.status = updates.status;
        user.isAllowed = updates.status === UserAccountStatus.Active;
      }

      if (updates.isAllowed !== undefined && updates.isAllowed !== user.isAllowed) {
        user.isAllowed = updates.isAllowed;
        user.status = updates.isAllowed ? UserAccountStatus.Active : UserAccountStatus.Suspended;
      }

      if (updates.role && updates.role !== user.role) {
        auditDetails.previousRole = user.role;
        auditDetails.newRole = updates.role;
        user.role = updates.role;
      }

      if (updates.productAccess) {
        auditDetails.previousAccess = user.productAccess;
        auditDetails.newAccess = updates.productAccess;
        user.productAccess = updates.productAccess;
      }

      await user.save();

      // Write Audit Log
      await createAuditTrace({
        actorId: adminId,
        action: updates.status === UserAccountStatus.Suspended ? AuditAction.UserSuspended : AuditAction.UserApproved,
        targetId: user._id.toString(),
        targetType: "User",
        details: auditDetails,
      });

      return {
        message: "User privileges modified successfully",
        status_code: StatusCodes.OK,
        data: {
          ...user.toObject(),
          id: encryptId(user._id),
        },
      };
    },
    "DATABASE_ERROR: Failed to update user access",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};
