import { z } from "zod";
import { createUserRequestBodySchema, signInRequestBodySchema } from "../zod-schema/user.zs";


export type TSignInRequestBody = z.infer< typeof signInRequestBodySchema>
export type TCreateUserRequestBody = z.infer< typeof createUserRequestBodySchema>