import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { deleteApi } from "@/src/lib/services/apis";
import { NextRequest } from "next/server";


export async function DELETE(req: NextRequest) {
    const authResponse = await authenticateToken(req);
    if (authResponse) return authResponse;
    const { apiId } = await req.json();
    const userId = (req as IAuthTokenRequest).user.id;
    return await deleteApi(apiId, userId);
}