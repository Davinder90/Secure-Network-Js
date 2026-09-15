import { NextRequest } from "next/server";
import {
  getCategories,
} from "@/src/lib/services/category";

/**
 * GET /api/categories
 * Public endpoint to fetch all active categories for tags and filter strips.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get("all") === "true";

  return await getCategories(!includeAll);
}

