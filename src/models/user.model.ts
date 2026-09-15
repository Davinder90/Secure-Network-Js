import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export enum UserRole {
  User = "user",
  Administrator = "administrator",
}

export enum UserAccountStatus {
  Pending = "pending",
  Active = "active",
  Suspended = "suspended",
}

/* -------------------------------------------------------------------------- */
/*                               INTERFACES                                   */
/* -------------------------------------------------------------------------- */

export interface IProductAccess {
  networking: boolean;
  security: boolean;
  api: boolean;
  articles: boolean;
  cloud: boolean;
}

export interface ISocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  youtube?: string;
  facebook?: string;
  instagram?: string;
}

export interface IArticleStats {
  totalArticles: number;
  totalReads: number;
  totalLikes: number;
}

export interface IUserModel extends Document {
  // Identity & Credentials
  name: string;
  email: string;
  password?: string;
  username: string;
  avatar: string;
  bio?: string;
  googleAuth: boolean;

  // Enterprise & Contact Metadata
  jobTitle?: string;
  department?: string;
  phone?: string;

  // Role & Permissions
  role: UserRole;
  isAllowed: boolean;
  isEmailVerified: boolean;
  productAccess: IProductAccess;

  // Blogger & Articles Engine
  socialLinks: ISocialLinks;
  articleStats: IArticleStats;
  articles: Types.ObjectId[];

  // Audit & Timestamps
  status: string,
  lastActiveAt: Date
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                        DICEBEAR AVATAR GENERATOR                          */
/* -------------------------------------------------------------------------- */

const AVATAR_SEEDS = [
  "Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob",
  "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley",
  "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"
];

const AVATAR_COLLECTIONS = ["notionists-neutral", "adventurer-neutral", "fun-emoji", "bottts-neutral"];

const generateDefaultAvatar = (): string => {
  const collection = AVATAR_COLLECTIONS[Math.floor(Math.random() * AVATAR_COLLECTIONS.length)];
  const seed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
  return `https://api.dicebear.com/7.x/${collection}/svg?seed=${seed}`;
};

/* -------------------------------------------------------------------------- */
/*                               SUB-SCHEMAS                                  */
/* -------------------------------------------------------------------------- */

const productAccessSchema = new Schema<IProductAccess>(
  {
    networking: { type: Boolean, default: true },
    security: { type: Boolean, default: false },
    api: { type: Boolean, default: false },
    articles: { type: Boolean, default: true },
    cloud: { type: Boolean, default: false },
  },
  { _id: false }
);

const socialLinksSchema = new Schema<ISocialLinks>(
  {
    github: { type: String, default: "", trim: true },
    twitter: { type: String, default: "", trim: true },
    linkedin: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    youtube: { type: String, default: "", trim: true },
    facebook: { type: String, default: "", trim: true },
    instagram: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const articleStatsSchema = new Schema<IArticleStats>(
  {
    totalArticles: { type: Number, default: 0 },
    totalReads: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/*                               USER SCHEMA                                  */
/* -------------------------------------------------------------------------- */

const userSchema = new Schema<IUserModel>(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      minlength: [3, "Username must be at least 3 characters long"],
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: generateDefaultAvatar,
    },
    bio: {
      type: String,
      maxlength: [250, "Bio cannot exceed 250 characters"],
      default: "",
    },
    googleAuth: {
      type: Boolean,
      default: false,
    },

    // Organization Metadata
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // Platform Access Control
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.User,
      required: true,
    },
    isAllowed: {
      type: Boolean,
      default: true,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    productAccess: {
      type: productAccessSchema,
      default: () => ({}),
    },

    // Articles & Community Metadata
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },
    articleStats: {
      type: articleStatsSchema,
      default: () => ({}),
    },
    articles: {
      type: [{ type: Schema.Types.ObjectId, ref: "Article" }],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(UserAccountStatus),
      default: UserAccountStatus.Pending, // New accounts start as pending
      index: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    // Session Timestamps
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel =
  (models.User as mongoose.Model<IUserModel>) ||
  model<IUserModel>("User", userSchema);

export default UserModel;
