import {Row, FormDataRow} from "@interfaces/api-tool/apiTool.interface"

// METHODS
export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"] as const;
export type HttpMethods = typeof HTTP_METHODS[number];

// TABS
export type TabType = "queryParams" | "authorization" | "headers" | "body" | "scripts" ;

// BODY
export const BODY_TYPES = [
  "none",
  "form-data",
  "x-www-form-urlencoded",
  "raw",
  "graphql",
] as const;
export type BodyType = typeof BODY_TYPES[number];

export const Raw_Body = ["Text", "JavaScript", "JSON", "HTML", "XML"] as const;
export type RawBodyType = typeof Raw_Body[number];

export type TBody = {
  type: BodyType,
  rawType?: RawBodyType,
  content?: string | null,
  urlEncoded?: Row[],
  formData?: FormDataRow[]
}

// AUTHORIZATION
export type AuthorizationType = {
    type: "none" | "basic" | "bearer" | "apiKey";
    username?: string;
    password?: string;
    token?: string;
    key?: string;
    value?: string;
    in?: "header" | "query";
  }

// CONTENT TYPE 
export const RAW_CONTENT_TYPES = [
  "application/json",
  "application/xml",
  "text/plain",
  "text/html",
  "application/javascript"
] as const;

export const COMMON_HEADERS = [
  '',
  "Authorization",
  "Content-Type",
  "Accept",
  "User-Agent",
  "Cache-Control",
  "Accept-Encoding",
  "Connection",
  "Cookie",
  "Set-Cookie",
  "Host",
  "Origin",
  "Referer",
  "Accept-Language",
  "X-Requested-With",
  "If-Modified-Since",
  "If-None-Match",
  "ETag",
  "Last-Modified",
  "Upgrade-Insecure-Requests",
  "Pragma",
  "Expires",
  "Via",
  "Forwarded",
  "DNT",
  "X-Forwarded-For",
  "X-Forwarded-Host",
  "X-Forwarded-Proto",
  "Access-Control-Allow-Origin",
  "Access-Control-Allow-Credentials",
  "Authorization-Bearer",
  "Content-Disposition",
  "Content-Length",
  "Transfer-Encoding",
  "X-CSRF-Token",
  "X-Frame-Options",
  "X-XSS-Protection",
  "Strict-Transport-Security"
] as const;

export type CommonHeaders = typeof COMMON_HEADERS[number];
export type HeaderType = { key: string; value: string; enabled: boolean; description?: string };

export const AUTH_TYPES = [
  "none",
  "basic",
  "bearer",
  "api-key",
  "oauth2",
  "digest"
] as const;

export const API_KEY_LOCATIONS = [
  "header",
  "query",
  "cookie"
] as const;

export const SCRIPT_TYPES = [
  "pre-request",
  "test",
  "collection-pre-request",
  "collection-test"
] as const;

export const SCRIPT_LANGUAGES = [
  "javascript"
] as const;

export const PARAM_TYPES = [
  "query",
  "path",
  "header",
  "cookie"
] as const;