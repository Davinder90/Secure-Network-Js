import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IArticleActivity {
  totalLikes: number;
  totalComments: number;
  totalReads: number;
  totalParentComments: number;
}

export interface IArticleModel extends Document {
  articleId: string;
  title: string;
  banner?: string;
  description?: string;
  content: unknown[];
  category?: Types.ObjectId; // Linked to dynamic Category model
  tags: string[];
  author: Types.ObjectId;
  activity: IArticleActivity;
  comments: Types.ObjectId[];
  draft: boolean;
  isFeatured: boolean;
  publishedAt: Date;
  updatedAt: Date;
}

const articleActivitySchema = new Schema<IArticleActivity>(
  {
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalReads: { type: Number, default: 0 },
    totalParentComments: { type: Number, default: 0 },
  },
  { _id: false }
);

const articleSchema = new Schema<IArticleModel>(
  {
    articleId: {
      type: String,
      required: [true, "Article ID is required"],
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    banner: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: "",
    },
    content: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    // Optional Category Document Reference
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      required: [true, "Author reference is required"],
      ref: "User",
      index: true,
    },
    activity: {
      type: articleActivitySchema,
      default: () => ({}),
    },
    comments: {
      type: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    draft: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true, // Enables fast filtering for featured stories
    }
  },
  {
    timestamps: {
      createdAt: "publishedAt",
      updatedAt: "updatedAt",
    },
  }
);

/* -------------------------------------------------------------------------- */
/*                               INDEXES                                      */
/* -------------------------------------------------------------------------- */

// 1. Text Search Index for Instant Search Bar Queries
articleSchema.index({
  title: "text",
  description: "text",
  tags: "text",
});

// 2. High-Performance Feed Indexes
articleSchema.index({ draft: 1, publishedAt: -1 });
articleSchema.index({ draft: 1, "activity.totalReads": -1, "activity.totalLikes": -1 });

const ArticleModel =
  (models.Article as mongoose.Model<IArticleModel>) ||
  model<IArticleModel>("Article", articleSchema);

export default ArticleModel;
