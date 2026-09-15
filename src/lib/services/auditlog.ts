import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { asyncRequestHandler, generateResponseObject } from "@helpers/common.helper";
import { IResponseObject } from "@/src/lib/interfaces/api.interfaces";
import AuditLogModel, { AuditAction } from "@/src/models/auditlog.model";
import UserModel from "@/src/models/user.model";
import { dbConnection } from "@/src/config/dbConnection";
import { encryptId } from "@/src/lib/helpers/crypto.helper";

interface ICreateAuditLogPayload {
  actorId: string;
  action: AuditAction;
  targetId: string;
  targetType: "User" | "Article" | "Category";
  details?: Record<string, any>;
}

/**
 * Persists an administrative event trace to the AuditLog collection.
 */
export const createAuditTrace = async (payload: ICreateAuditLogPayload) => {
  try {
    await dbConnection();
    const { actorId, action, targetId, targetType, details = {} } = payload;

    const log = new AuditLogModel({
      actor: new mongoose.Types.ObjectId(actorId),
      action,
      targetId: String(targetId),
      targetType,
      details,
    });

    await log.save();
    return log;
  } catch (err) {
    console.error("FAILED_TO_WRITE_AUDIT_LOG:", err);
    return null;
  }
};

/**
 * Retrieves paginated, sorted, and populated administrative audit logs.
 */
export const getAdminAuditLogs = async (adminId: string, page: number = 1, limit: number = 15) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const skip = (page - 1) * limit;

      const [logs, totalDocs] = await Promise.all([
        AuditLogModel.find({})
          .populate({
            path: "actor",
            model: UserModel,
            select: "name username avatar",
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditLogModel.countDocuments({}),
      ]);

      // Encrypt identifiers for frontend table rendering
      const sanitizedLogs = logs.map((log: any) => ({
        ...log,
        id: encryptId(log._id),
        actorId: encryptId(log.actor?._id || ""),
      }));

      const totalPages = Math.ceil(totalDocs / limit);

      return {
        message: "Audit logs retrieved successfully",
        status_code: StatusCodes.OK,
        data: {
          logs: sanitizedLogs,
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
    "DATABASE_ERROR: Failed to retrieve audit logs",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};
