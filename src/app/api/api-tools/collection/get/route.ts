import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { getCollections } from "@/src/lib/services/collection";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
    const authResponse = await authenticateToken(req);
    if (authResponse) return authResponse;
    const userId = (req as IAuthTokenRequest).user.id;
    return await getCollections(userId);
}