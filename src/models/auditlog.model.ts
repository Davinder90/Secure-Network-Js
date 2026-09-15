import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export enum AuditAction {
  UserApproved = "USER_APPROVED",
  UserSuspended = "USER_SUSPENDED",
  UserRoleChanged = "USER_ROLE_CHANGED",
  ProductAccessUpdated = "PRODUCT_ACCESS_UPDATED",
  ArticleDeleted = "ARTICLE_DELETED",
  ArticleFeatured = "ARTICLE_FEATURED",
  CategoryCreated = "CATEGORY_CREATED",
  CategoryUpdated = "CATEGORY_UPDATED",
  CategoryDeleted = "CATEGORY_DELETED",
}

export interface IAuditLogModel extends Document {
  actor: Types.ObjectId; // The Admin who performed the action
  action: AuditAction;
  targetId?: string;     // The ID of the affected User, Article, or Category
  targetType: "User" | "Article" | "Category";
  details?: Record<string, any>; // e.g. { previousRole: 'user', newRole: 'administrator' }
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogModel>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      default: "",
    },
    targetType: {
      type: String,
      enum: ["User", "Article", "Category"],
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Logs are append-only (immutable)
  }
);

const AuditLogModel =
  (models.AuditLog as mongoose.Model<IAuditLogModel>) ||
  model<IAuditLogModel>("AuditLog", auditLogSchema);

export default AuditLogModel;
