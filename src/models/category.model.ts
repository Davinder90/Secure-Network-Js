import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ICategoryModel extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isFeatured: boolean;
  isActive: boolean;
  articleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    icon: {
      type: String,
      default: "", // Can store Heroicon name, SVG slug, or badge string
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    articleCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before validation if not provided
categorySchema.pre("validate", function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});

const CategoryModel =
  (models.Category as mongoose.Model<ICategoryModel>) ||
  model<ICategoryModel>("Category", categorySchema);

export default CategoryModel;
