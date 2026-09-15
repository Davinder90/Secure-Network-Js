import { createUser } from "@/src/lib/services/user";
import { validateSchema } from "@helpers/zod.helpers";
import { createUserRequestBodySchema } from "@zod-schema/user.zs";
import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validationError = await validateSchema(body, createUserRequestBodySchema);
  if (!validationError.success) return NextResponse.json(validationError, {status: StatusCodes.BAD_REQUEST});
  return createUser(body);
}
