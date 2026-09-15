import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface ICommentModel extends Document {
  article: Types.ObjectId;
  articleAuthor: Types.ObjectId;
  comment: string;
  commentedBy: Types.ObjectId;
  isReply: boolean;
  parent?: Types.ObjectId;
  children: Types.ObjectId[];
  childrenLevel: number;
  commentedAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentModel>(
  {
    article: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Article",
      index: true,
    },
    articleAuthor: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    commentedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    children: {
      type: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    childrenLevel: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "commentedAt",
      updatedAt: "updatedAt",
    },
  }
);

const CommentModel =
  (models.Comment as mongoose.Model<ICommentModel>) ||
  model<ICommentModel>("Comment", commentSchema);

export default CommentModel;
