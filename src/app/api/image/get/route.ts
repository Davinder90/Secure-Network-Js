import { NextRequest } from "next/server";
import { getImage } from "@/src/lib/helpers/file.helpers";
import { generateResponseObject } from "@/src/lib/helpers/common.helper";

/**
 * GET /api/image/get?filename=178920...png
 * Returns standard JSON response: { message, status_code, data: { filename, base64Image } }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename") || "";

  return await getImage(filename);
}
