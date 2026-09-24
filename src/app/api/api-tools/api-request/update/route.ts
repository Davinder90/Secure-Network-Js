import { validateSchema } from "@/src/lib/helpers/zod.helpers";
import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { updateApi } from "@/src/lib/services/apis";
import { ApiSchema } from "@/src/lib/zod-schema/api.zs";
import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const authResponse = await authenticateToken(req, "api");
  if (authResponse) return authResponse;
  const body = await req.json();
  const validationError = await validateSchema(body, ApiSchema);
  if (!validationError.success) return NextResponse.json(validationError, {status: StatusCodes.BAD_REQUEST});
  const userId = (req as IAuthTokenRequest).user.id;
  return updateApi(body._id, userId, body);
}
