import {HttpMethods, TabType} from "@type/ui/api/api.type"

export const methodColors: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-yellow-400",
  DELETE: "text-red-400",
  PATCH: "text-purple-400",
  OPTIONS: "text-cyan-400",
  HEAD: "text-pink-400",
};

export const METHODS_WITHOUT_BODY: HttpMethods[] = ["GET", "HEAD"];

export const TABS: TabType[] = ["queryParams", "authorization", "headers", "body", "scripts"];
