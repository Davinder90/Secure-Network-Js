import { NextRequest } from "next/server";
import { deleteFile, inputFile } from "@helpers/file.helpers";
import { IBannerSnap } from "@interfaces/article/Image.Interface";
import { authenticateToken } from "src/lib/middleware/auth.middleware";
import { parseSingleFile } from "src/lib/middleware/formidable.middleware";
import { IMAGE_STORAGE_PATH } from "@utils/constants";

/**
 * PUT /api/image/replace?username=...&previousFilename=...
 */
export async function PUT(req: NextRequest) {
  const authResponse = await authenticateToken(req, "articles");
  if (authResponse) return authResponse;

  const searchParams = req.nextUrl.searchParams;
  const username = searchParams.get("username") || "user";
  const previousFilename = searchParams.get("previousFilename");

  // Delete previous file by filename if passed
  if (previousFilename && previousFilename.trim()) {
    await deleteFile(previousFilename);
  }

  // Parse new file
  const snap_result = await parseSingleFile(
    req,
    IMAGE_STORAGE_PATH,
    username
  );

  const result: IBannerSnap[] = [
    {
      filename: snap_result.filename,
      url: `/api/image/get?filename=${encodeURIComponent(snap_result.filename)}`,
    },
  ];

  return await inputFile(result);
}
