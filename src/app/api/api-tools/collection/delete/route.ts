import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { deleteCollection } from "@/src/lib/services/collection";
import { NextRequest } from "next/server";


export async function DELETE(req: NextRequest) {
  const authResponse = await authenticateToken(req, "api");
  if (authResponse) return authResponse;
  const { collectionId } = await req.json();
  const userId = (req as IAuthTokenRequest).user.id;
  return await deleteCollection(collectionId, userId);
}