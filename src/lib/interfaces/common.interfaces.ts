import { NextRequest } from "next/server";

export type serviceType = "networking" | "api" | "security" | "articles" | "pass";

export interface IProductAccess {
  networking: boolean;
  security: boolean;
  api: boolean;
  articles: boolean;
  cloud: boolean;
}

export interface IDecodeUser {
  id: string;
  role: "user" | "administrator";
  productAccess: IProductAccess;
  email?: string;
  username?: string;
  iat?: number;
  exp?: number;
}

export interface IAuthTokenRequest extends NextRequest {
  user: IDecodeUser;
}

export interface IResponseObject {
  message?: string;
  error?: string;
  data?: object | null | any;
  status_code?: number;
}
