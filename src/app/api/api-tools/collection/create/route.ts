import { IAuthTokenRequest } from "@/src/lib/interfaces/common.interfaces";
import { authenticateToken } from "@/src/lib/middleware/auth.middleware";
import { createCollection } from "@/src/lib/services/collection";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
     const authResponse = await authenticateToken(req, "api");
      if (authResponse) return authResponse;
    const body = await req.json();
    return await createCollection({...body, createdBy: (req as IAuthTokenRequest).user.id});
}