import { StatusCodes } from "http-status-codes";
import { NextRequest } from "next/server";
import {
  IAuthTokenRequest,
  IDecodeUser,
  IResponseObject,
} from "@interfaces/common.interfaces";
import { verifyAccessToken } from "@helpers/auth.helpers";
import { generateResponseObject } from "../helpers/common.helper";

export const authenticateToken = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    const errorResponse: IResponseObject = {
      error: "Access token required",
      status_code: StatusCodes.UNAUTHORIZED,
    };
    return generateResponseObject(errorResponse);
  }

  const verification = verifyAccessToken(authHeader);

  if (!verification.success || !verification.data) {
    const errorResponse: IResponseObject = {
      error: verification.error || "Unauthorized",
      status_code: StatusCodes.UNAUTHORIZED,
    };
    return generateResponseObject(errorResponse);
  }

  // Attach decoded user onto request object
  (req as IAuthTokenRequest).user = verification.data as IDecodeUser;

  return null; // Return null when authenticated successfully
};
