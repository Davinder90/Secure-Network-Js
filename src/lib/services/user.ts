import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import {
  asyncRequestHandler,
  generateResponseObject,
} from "@helpers/common.helper";
import { IResponseObject } from "@/src/lib/interfaces/api.interfaces";
import { TCreateUserRequestBody, TSignInRequestBody } from "@type/user.type";
import {
  comparePassword,
  generateAccessToken,
  generateHashPassword,
} from "@helpers/auth.helpers";
import UserModel, { UserAccountStatus, UserRole } from "@/src/models/user.model";
import ArticleModel from "@/src/models/article.model"
import { dbConnection } from "@/src/config/dbConnection";
import { encryptId } from "../helpers/crypto.helper";

/**
 * Generates an iterative, collision-free username based on the user's name.
 */
export const generateUsername = async (name: string): Promise<string> => {
  const base = (name || "user")
    .split(" ")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  let isUnique = false;
  let username = "";

  while (!isUnique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    username = `${base}${randomNum}`;
    const exists = await UserModel.exists({ username });
    if (!exists) {
      isUnique = true;
    }
  }

  return username;
};

/**
 * Authenticates a user and issues a signed access token.
 */
export const signIn = async (data: TSignInRequestBody) => {
  await dbConnection();


  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const { email, password } = data;
      const normalizedEmail = email.toLowerCase().trim();

      // Must explicitly select +password because select: false is enabled in schema
      const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");

      if (!user || !(await comparePassword(password, user.password as string))) {
        return {
          error: "Invalid email or password",
          status_code: StatusCodes.UNAUTHORIZED,
        };
      }

      // Update last active login timestamp
      user.lastLoginAt = new Date();
      await user.save();

      const access_token = generateAccessToken(user._id.toString());

      return {
        message: "Login successful",
        status_code: StatusCodes.OK,
        data: {
          access_token,
          user: {
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isAllowed: user.isAllowed,
            productAccess: user.productAccess,
          },
        },
      };
    },
    "DATABASE_ERROR, An error occurred while processing your request.",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/**
 * Creates a new user or boots up the initial root administrator account.
 */
export const createUser = async (
  data: TCreateUserRequestBody,
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const { name, email, password } = data;
      const normalizedEmail = email.toLowerCase().trim();
      const usersCount = await UserModel.countDocuments();

      // Scenario 1: First user creation (Auto-promoted to Administrator with full access)
      if (usersCount === 0) {
        const hashedPassword = await generateHashPassword(password);
        const username = await generateUsername(name);

        const newAdmin = new UserModel({
          ...data,
          email: normalizedEmail,
          password: hashedPassword,
          username,
          role: UserRole.Administrator,
          isAllowed: usersCount == 0 ? true : false,
          isEmailVerified: true,
          productAccess: {
            networking: true,
            security: true,
            api: true,
            articles: true,
            cloud: true,
          },
          status: UserAccountStatus.Active
        });

        await newAdmin.save();
        const access_token = generateAccessToken(newAdmin._id.toString());

        return {
          message: "Root administrator account created successfully",
          status_code: StatusCodes.CREATED,
          data: {
            access_token,
            email: newAdmin.email,
            username: newAdmin.username,
            role: newAdmin.role,
            productAccess: newAdmin.productAccess,
          },
        };
      }

      const existingUser = await UserModel.findOne({ email: normalizedEmail });
      if (existingUser) {
        return {
          error: "Email address already registered",
          status_code: StatusCodes.CONFLICT,
        };
      }

      const hashedPassword = await generateHashPassword(password);
      const username = await generateUsername(name);

      const newUser = new UserModel({
        ...data,
        email: normalizedEmail,
        password: hashedPassword,
        username,
        role: UserRole.User,
        isAllowed: false, // Subject to approval
        status: UserAccountStatus.Pending
      });

      await newUser.save();
      const access_token = generateAccessToken(newUser._id.toString());

      return {
        message: "User account created successfully",
        status_code: StatusCodes.CREATED,
        data: {
          access_token,
          user: {
            id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            isAllowed: newUser.isAllowed,
            productAccess: newUser.productAccess,
          },
        },
      };
    },
    "DATABASE_ERROR, An error occurred while processing your request.",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/**
 * Checks if a given email belongs to an active administrator.
 */
export const isAdmin = async (userId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      if (!userId || !mongoose.isValidObjectId(userId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }
  
      const user = await UserModel.findById(userId).select("role isAllowed");

      if (!user) {
        return {
          error: "User not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      const isAdministrator = user.role === UserRole.Administrator;
      return {
        message: isAdministrator ? "Admin verified" : "User is not an admin",
        status_code: StatusCodes.OK,
        data: {
          isAdmin: isAdministrator,
          isAllowed: user.isAllowed,
        },
      };
    },
    "DATABASE_ERROR: Failed to check admin status",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/**
 * Checks platform access allowance for a user.
 */
export const getUserAllowance = async (userId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      if (!userId || !mongoose.isValidObjectId(userId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }
    
      const user = await UserModel.findById(userId).select(
        "isAllowed productAccess role isEmailVerified status"
      );

      if (!user) {
        return {
          error: "User not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      return {
        message: "Allowance fetched successfully",
        status_code: StatusCodes.OK,
        data: {
          isAllowed: user.isAllowed,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          productAccess: user.productAccess,
        },
      };
    },
    "Internal Server Error, please try again later",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};


/**
 * Retrieves the full profile details of the authenticated user.
 */
export const getMyProfile = async (
  userId: string,
  page: number = 1,
  limit: number = 5
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      if (!userId || !mongoose.isValidObjectId(userId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const validatedPage = Math.max(1, Number(page) || 1);
      const validatedLimit = Math.max(1, Math.min(20, Number(limit) || 5));
      const skip = (validatedPage - 1) * validatedLimit;

      // 1. Fetch user profile data excluding sensitive fields
      const user = await UserModel.findById(userId)
        .select("-password")
        .lean();

      if (!user) {
        return {
          error: "User not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      // 2. Query paginated articles authored by this user
      const [articles, totalArticles] = await Promise.all([
        ArticleModel.find({ author: new mongoose.Types.ObjectId(userId) })
          .select("title description banner activity publishedAt articleId draft")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validatedLimit)
          .lean(),
        ArticleModel.countDocuments({ author: new mongoose.Types.ObjectId(userId) }),
      ]);

      // 3. Encrypt article IDs before sending them to the client
      const encryptedArticles = articles.map((art: any) => {
        const { _id, ...rest } = art;
        return {
          ...rest,
          id: encryptId(_id),
        };
      });

      const totalPages = Math.ceil(totalArticles / validatedLimit);

      // 4. Encrypt user ID and structure response
      const { _id, ...sanitizedUser } = user as any;

      return {
        message: "Profile retrieved successfully",
        status_code: StatusCodes.OK,
        data: {
          ...sanitizedUser,
          id: encryptId(_id),
          articles: encryptedArticles,
          pagination: {
            currentPage: validatedPage,
            totalPages,
            totalArticles,
            limit: validatedLimit,
            hasMore: validatedPage < totalPages,
          },
        },
      };
    },
    "DATABASE_ERROR: Failed to retrieve profile",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/**
 * Updates profile details for the authenticated user.
 */

export interface ISocialLinksPayload {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  youtube?: string;
  facebook?: string;
  instagram?: string;
}

export interface IUpdateProfileRequestBody {
  name?: string;
  bio?: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  socialLinks?: ISocialLinksPayload;
}

export const updateMyProfile = async (
  userId: string,
  updateData: IUpdateProfileRequestBody
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      if (!userId || !mongoose.isValidObjectId(userId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      // Whitelist updateable fields to prevent unauthorized privilege escalation
      const allowedUpdates: Record<string, unknown> = {};

      if (updateData.name) allowedUpdates.name = updateData.name.trim();
      if (updateData.bio !== undefined) allowedUpdates.bio = updateData.bio.trim();
      if (updateData.avatar) allowedUpdates.avatar = updateData.avatar.trim();
      if (updateData.jobTitle !== undefined) allowedUpdates.jobTitle = updateData.jobTitle.trim();
      if (updateData.department !== undefined) allowedUpdates.department = updateData.department.trim();
      if (updateData.phone !== undefined) allowedUpdates.phone = updateData.phone.trim();

      // Handle nested social links update without overwriting unspecified links
      if (updateData.socialLinks) {
        Object.entries(updateData.socialLinks).forEach(([key, val]) => {
          if (typeof val === "string") {
            allowedUpdates[`socialLinks.${key}`] = val.trim();
          }
        });
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: allowedUpdates },
        { new: true, runValidators: true }
      ).select("-password -_id");

      if (!updatedUser) {
        return {
          error: "User not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      return {
        message: "Profile updated successfully",
        status_code: StatusCodes.OK,
        data: updatedUser,
      };
    },
    "DATABASE_ERROR: Failed to update profile",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
}


/**
 * Service function to verify current password and update with a new hashed password.
 */

interface IChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
}

export const changePassword = async (
  userId: string,
  payload: IChangePasswordPayload
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      // 1. Validate ObjectId format
      if (!userId || !mongoose.isValidObjectId(userId)) {
        return {
          error: "Invalid user ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const { currentPassword, newPassword } = payload;

      // 2. Validate input presence
      if (!currentPassword || !newPassword) {
        return {
          error: "Current password and new password are required",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      // 3. Prevent identical password reuse
      if (currentPassword === newPassword) {
        return {
          error: "New password cannot be the same as the current password",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      // 4. Validate password length
      if (newPassword.length < 6) {
        return {
          error: "New password must be at least 6 characters long",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      // 5. Query user with password hash
      const user = await UserModel.findById(userId).select("+password");

      if (!user || !user.password) {
        return {
          error: "User not found or account uses third-party auth",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      // 6. Verify existing password
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return {
          error: "Current password does not match",
          status_code: StatusCodes.UNAUTHORIZED,
        };
      }

      // 7. Hash new password and persist
      user.password = await generateHashPassword(newPassword);
      await user.save();

      return {
        message: "Password updated successfully",
        status_code: StatusCodes.OK,
      };
    },
    "DATABASE_ERROR: Failed to update password",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};