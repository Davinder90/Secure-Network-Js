import { Schema, model, models } from "mongoose";
import {
  AuthorizationType,
  BODY_TYPES,
  HeaderType,
  HTTP_METHODS,
  HttpMethods,
  Raw_Body,
  TBody,
} from "@type/ui/api/api.type";

import {IExecuteResponse, Row} from "@interfaces/api-tool/apiTool.interface"

export interface IApi {
  name: string;
  method: HttpMethods;
  url: string;
  headers?: HeaderType[];
  queryParams?: Row[];
  body?: TBody;
  auth?: AuthorizationType;
  variables?: { key: string; value: string }[];
  preRequestScript?: string;
  testScript?: string;
  response?: IExecuteResponse | null;
}

export interface IApiDocument {
  reqType: "single" | "multi";
  createdBy?: string,
  name: string;
  collectionId: string;
  apiData?: IApi;
  apisData?: IApi[];
  createdAt?: string;
  updatedAt?: string;
}

const apiItemSchema = new Schema<IApi>(
  {
    name: { type: String, trim: true },
    method: {
      type: String,
      enum: HTTP_METHODS,
    },
    url: String,

    headers: [
      {
        key: String,
        value: String,
        enabled: { type: Boolean, default: true },
        description: String,
      },
    ],

    queryParams: [
      {
        key: String,
        value: String,
        description: String,
        enabled: { type: Boolean, default: true },
      },
    ],

    body: {
      type: {
        type: String,
        enum: BODY_TYPES,
        default: "none",
      },
      rawType: {
        type: String,
        enum: Raw_Body,
        default: "Text",
      },
      content: { type: String, default: null },

      urlEncoded: [
        {
          key: String,
          value: String,
          description: String,
          enabled: { type: Boolean, default: true },
        },
      ],

      formData: [
        {
          key: String,
          value: String,
          description: String,
          type: { type: String, enum: ["text", "file"], default: "text" },
          enabled: { type: Boolean, default: true },
        },
      ],
    },

    response: {
      success: { type: Boolean, default: false },
      status_code: Number,
      statusText: String,
      time: Number,
      size: Number,
      reqheaders: { type: Map, of: String, default: {} },
      resheaders: { type: Map, of: String, default: {} },
      data: Schema.Types.Mixed,
      error: Schema.Types.Mixed,
    },

    auth: {
      type: { type: String, enum: ["none", "basic", "bearer", "apiKey"], default: "none" },
      username: String,
      password: String,
      token: String,
      key: String,
      value: String,
      in: { type: String, enum: ["header", "query"] },
    },

    variables: [{ key: String, value: String }],

    preRequestScript: String,
    testScript: String,
  },
  { _id: false }
);

const apiSchema = new Schema<IApiDocument>(
  {
    reqType: {
      type: String,
      enum: ["single", "multi"],
      default: "single",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },

    collectionId: { type: String, required: true },

    // single API
    apiData: apiItemSchema,

    // automation APIs
    apisData: [apiItemSchema],
  },
  { timestamps: true }
);

apiSchema.index({ collectionId: 1, name: 1 });

const ApiModel =
  models.Api || model<IApiDocument>("Api", apiSchema);

export default ApiModel;