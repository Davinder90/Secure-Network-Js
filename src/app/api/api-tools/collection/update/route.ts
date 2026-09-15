import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { updateCollection } from "@/src/lib/services/collection";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  if (authResponse) return authResponse;
  const body = await req.json();
  const collectionId = body._id;
  if (!collectionId) {
    return new Response("collectionId is required", { status: 400 });
  }
  const userId = (req as IAuthTokenRequest).user.id;
  return updateCollection(collectionId, userId, body);
}
