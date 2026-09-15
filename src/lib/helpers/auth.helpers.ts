import { env_var } from "@/src/config/env.config";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const JWT_EXPIRES_IN = "2d";

export interface ITokenPayload extends JwtPayload {
  id: string;
}

export interface IVerifyTokenResult {
  success: boolean;
  data: ITokenPayload | null;
  error?: string;
}

/**
 * Generates a signed JWT access token valid for 2 days.
 */
export const generateAccessToken = (
  user_id: string,
  expiresIn: SignOptions["expiresIn"] = JWT_EXPIRES_IN
): string => {
  if (!env_var.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in the environment.");
  }

  return jwt.sign({ id: user_id }, env_var.JWT_SECRET as string, {
    expiresIn,
  });
};

/**
 * Hashes a plaintext password using bcrypt with 10 salt rounds.
 */
export const generateHashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

/**
 * Compares a plaintext password against a stored hash.
 */
export const comparePassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashPassword);
};

/**
 * Verifies and decodes the JWT token, returning a result object.
 */
export const verifyAccessToken = (rawToken: string): IVerifyTokenResult => {
  if (!env_var.JWT_SECRET) {
    return {
      success: false,
      data: null,
      error: "JWT_SECRET is not configured",
    };
  }

  if (!rawToken || typeof rawToken !== "string") {
    return {
      success: false,
      data: null,
      error: "Authorization token is missing",
    };
  }

  const token = rawToken.startsWith("Bearer ")
    ? rawToken.slice(7).trim()
    : rawToken.trim();

  try {
    const decoded = jwt.verify(token, env_var.JWT_SECRET as string) as ITokenPayload;

    if (!decoded || !decoded.id) {
      return {
        success: false,
        data: null,
        error: "Invalid token payload",
      };
    }

    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    const err = error as Error;
    if (err.name === "TokenExpiredError") {
      return {
        success: false,
        data: null,
        error: "Access token has expired",
      };
    }
    return {
      success: false,
      data: null,
      error: "Invalid or malformed access token",
    };
  }
};
