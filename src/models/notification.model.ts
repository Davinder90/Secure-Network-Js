import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export enum NotificationType {
  Like = "like",
  Comment = "comment",
  Reply = "reply",
}

export interface INotificationModel extends Document {
  type: NotificationType;
  article: Types.ObjectId;
  notificationFor: Types.ObjectId;
  user: Types.ObjectId;
  comment?: Types.ObjectId;
  reply?: Types.ObjectId;
  repliedOnComment?: Types.ObjectId;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationModel>(
  {
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },
    article: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Article",
      index: true,
    },
    notificationFor: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    repliedOnComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    seen: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel =
  (models.Notification as mongoose.Model<INotificationModel>) ||
  model<INotificationModel>("Notification", notificationSchema);

export default NotificationModel;
