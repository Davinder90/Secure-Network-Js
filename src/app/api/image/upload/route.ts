import { NextRequest } from "next/server";
import { inputFile } from "@helpers/file.helpers";
import { IBannerSnap } from "@interfaces/article/Image.Interface";
import { authenticateToken } from "src/lib/middleware/auth.middleware";
import { parseSingleFile } from "src/lib/middleware/formidable.middleware";
import { IMAGE_STORAGE_PATH } from "@utils/constants";

export async function POST(req: NextRequest) {
  const authResponse = await authenticateToken(req, "articles");
  if (authResponse) return authResponse;

  const searchParams = req.nextUrl.searchParams;
  const username = searchParams.get("username") || "user";

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
