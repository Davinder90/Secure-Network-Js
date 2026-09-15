import { ZodSchema } from "zod";

export const validateSchema = async <T extends object>(
  body: object,
  schema: ZodSchema<T>
) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { success: false, message: result.error.issues[0].message }
  }
  return {success: true, data: result.data}
};
