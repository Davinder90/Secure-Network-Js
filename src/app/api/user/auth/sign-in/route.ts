import { validateSchema } from "@helpers/zod.helpers";
import { signInRequestBodySchema } from "@zod-schema/user.zs";
import { signIn } from "@services/user";
import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validationError = await validateSchema(body, signInRequestBodySchema);
  if (!validationError.success) return NextResponse.json(validationError, {status: StatusCodes.BAD_REQUEST});
  return signIn(body);
}
