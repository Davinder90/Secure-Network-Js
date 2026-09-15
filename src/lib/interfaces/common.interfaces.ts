import { NextRequest } from "next/server";

export interface IDecodeUser {
  id: string;
}

export interface IAuthTokenRequest extends NextRequest {
  user: IDecodeUser;
}

export interface IResponseObject {
  message?: string;
  error?: string;
  data?: object | null;
  status_code?: number;
}
