import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";
import {
  IAuthTokenRequest,
  IDecodeUser,
  IResponseObject,
} from "@interfaces/common.interfaces";
import { verifyAccessToken } from "@helpers/auth.helpers";
import { generateResponseObject } from "../helpers/common.helper";
import UserModel, { UserRole } from "@/src/models/user.model";
import { dbConnection } from "@/src/config/dbConnection";

// 1. Dynamic string-based type matching your exact productAccess schema properties
export type TServiceType = "networking" | "api" | "security" | "articles" | "pass";

const SERVICE_PERMISSION_MAP: Record<Exclude<TServiceType, "pass">, keyof IDecodeUser["productAccess"]> = {
  networking: "networking",
  api: "api",
  security: "security",
  articles: "articles",
};

/**
 * Authenticates the JWT access token and optionally enforces module-level permissions.
 *
 * @param req - Incoming NextRequest
 * @param requiredService - Optional module service type ('networking' | 'api' | 'security' | 'articles' | 'pass')
 * @returns null if authenticated and authorized, or a formatted NextResponse error
 */
export const authenticateToken = async (
  req: NextRequest,
  requiredService?: TServiceType
): Promise<NextResponse | null> => {
  // 1. Validate Authorization Header
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    const errorResponse: IResponseObject = {
      error: "Access token required",
      status_code: StatusCodes.UNAUTHORIZED,
    };
    return generateResponseObject(errorResponse) as NextResponse;
  }

  // 2. Verify JWT Signature and Expiration
  const verification = verifyAccessToken(authHeader);

  if (!verification.success || !verification.data) {
    const errorResponse: IResponseObject = {
      error: verification.error || "Unauthorized",
      status_code: StatusCodes.UNAUTHORIZED,
    };
    return generateResponseObject(errorResponse) as NextResponse;
  }

  const userId = verification.data.id;

  // 3. Connect DB and Fetch Latest User Permissions & Role
  await dbConnection();
  const user = await UserModel.findById(userId).select(
    "isAllowed role productAccess status"
  );

  if (!user) {
    const errorResponse: IResponseObject = {
      error: "User account no longer exists",
      status_code: StatusCodes.UNAUTHORIZED,
    };
    return generateResponseObject(errorResponse) as NextResponse;
  }

  // 4. Verify Master Platform Allowance
  if (!user.isAllowed || user.status === "suspended") {
    const errorResponse: IResponseObject = {
      error: "Account access restricted. Please contact your administrator.",
      status_code: StatusCodes.FORBIDDEN,
    };
    return generateResponseObject(errorResponse) as NextResponse;
  }

  // 5. Verify Specific Module Permission (Administrators bypass module checks, "pass" skips checks)
  if (requiredService && requiredService !== "pass" && user.role !== UserRole.Administrator) {
    const mappedKey = SERVICE_PERMISSION_MAP[requiredService];
    const isServiceAllowed = user.productAccess?.[mappedKey] ?? false;

    if (!isServiceAllowed) {
      const errorResponse: IResponseObject = {
        error: `Access denied: You do not have permissions for the '${requiredService}' module.`,
        status_code: StatusCodes.FORBIDDEN,
      };
      return generateResponseObject(errorResponse) as NextResponse;
    }
  }

  // 6. Attach Decoded User & Live DB Role to Request
  (req as IAuthTokenRequest).user = {
    ...verification.data,
    role: user.role,
    productAccess: user.productAccess,
  } as IDecodeUser;

  return null; // Successfully authenticated and authorized
};
