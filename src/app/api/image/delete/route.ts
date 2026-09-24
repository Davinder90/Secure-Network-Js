import { NextRequest, NextResponse } from "next/server";
import { deleteFile } from "@helpers/file.helpers";
import { authenticateToken } from "src/lib/middleware/auth.middleware";
import { generateResponseObject } from "@/src/lib/helpers/common.helper";
import { StatusCodes } from "http-status-codes";

/**
 * DELETE /api/image/delete?filename=1789207111213-921541513-davinder-banner.png
 * Secures file deletion by requiring authentication and confining paths.
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  // 1. Authenticate JWT session token
  const authResponse = await authenticateToken(req, "articles");
  if (authResponse) return authResponse as NextResponse;

  // 2. Extract sanitized filename from searchParams query parameters
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename") || "";

  if (!filename.trim()) {
    return generateResponseObject({
      error: "Filename query parameter is required",
      status_code: StatusCodes.BAD_REQUEST,
    });
  }

  // 3. Delegate to your secure deleteFile helper (takes filename only)
  return (await deleteFile(filename)) as NextResponse;
}
