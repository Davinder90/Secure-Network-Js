import { z } from "zod";
import { BODY_TYPES, HTTP_METHODS, Raw_Body } from "@type/ui/api/api.type";


export const HttpMethodsSchema = z.enum(HTTP_METHODS);

export const ReqTypeSchema = z.enum(["single", "multi"]);

export const KeyValueSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const HeaderSchema = KeyValueSchema.extend({
  enabled: z.boolean().optional(),
  description: z.string().optional(),
});

export const QueryParamSchema = KeyValueSchema.extend({
  enabled: z.boolean().optional(),
  description: z.string().optional(),
});


export const BodySchema = z.object({
  type: z.enum(BODY_TYPES),
  rawType: z
    .enum(Raw_Body)
    .optional(),
  content: z.string().nullable().optional(),

  urlEncoded: z
    .array(QueryParamSchema)
    .optional(),

  formData: z
    .array(
      QueryParamSchema.extend({
        type: z.enum(["text", "file"]).optional(),
      })
    )
    .optional(),
});


export const AuthorizationSchema = z.object({
  type: z.enum(["none", "basic", "bearer", "apiKey"]),
  username: z.string().optional(),
  password: z.string().optional(),
  token: z.string().optional(),
  key: z.string().optional(),
  value: z.string().optional(),
  in: z.enum(["header", "query"]).optional(),
});


export const ExecuteResponseSchema = z.object({
  success: z.boolean().optional(),
  status_code: z.number().optional(),
  statusText: z.string().optional(),
  time: z.number().optional(),
  size: z.number().optional(),
  reqheaders: z.record(z.string(), z.string()).optional(),
  resheaders: z.record(z.string(), z.string()).optional(),
  data: z.any().optional(),
  error: z.any().optional(),
});


export const ApiItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  method: HttpMethodsSchema,
  url: z.string().url("Invalid URL"),

  headers: z.array(HeaderSchema).optional(),
  queryParams: z.array(QueryParamSchema).optional(),

  body: BodySchema.optional(),
  auth: AuthorizationSchema.optional(),

  variables: z.array(KeyValueSchema).optional(),

  preRequestScript: z.string().optional(),
  testScript: z.string().optional(),

  response: ExecuteResponseSchema.nullable().optional(),
});


export const ApiSchema = z
  .object({
    reqType: ReqTypeSchema,
    createdBy: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    collectionId: z.string(),

    apiData: ApiItemSchema.optional(),
    apisData: z.array(ApiItemSchema).optional(),

    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.reqType === "single" && !data.apiData) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "apiData is required when reqType is 'single'",
        path: ["apiData"],
      });
    }

    if (data.reqType === "multi" && !data.apisData) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "apisData is required when reqType is 'automation'",
        path: ["apisData"],
      });
    }
  });