import Api, { IApi, IApiDocument } from "@models/api.model";
import { StatusCodes } from "http-status-codes";
import {
  asyncRequestHandler,
  generateResponseObject,
} from "@helpers/common.helper";
import { IResponseObject } from "@/src/lib/interfaces/api.interfaces";
import { dbConnection } from "@/src/config/dbConnection";
import { ApiExecutor } from "@helpers/apiTool.helper";
import CollectionModel from "@/src/models/collection.model";
import mongoose from "mongoose";


export class AutomationExecutor {
  private apis: IApi[];
  private variables: Record<string, any>;

  constructor(apis: IApi[]) {
    this.apis = apis;
    this.variables = {};
  }

  private interpolate(value: any) {
    if (typeof value !== "string") return value;

    return value.replace(/{{(.*?)}}/g, (_, key) => {
      const keys = key.trim().split(".");
      let val: any = this.variables;

      for (const k of keys) {
        val = val?.[k];
      }

      return val ?? "";
    });
  }

  private replaceVariables(api: IApi): IApi {
    const cloned = JSON.parse(JSON.stringify(api));

    if (cloned.url) {
      cloned.url = this.interpolate(cloned.url);
    }

    if (cloned.headers) {
      cloned.headers = cloned.headers.map((h: any) => ({
        ...h,
        value: this.interpolate(h.value),
      }));
    }

    if (cloned.body?.content) {
      cloned.body.content = this.interpolate(cloned.body.content);
    }

    return cloned;
  }

  async run() {
    const responses = [];

    for (const api of this.apis) {
      const parsedApi = this.replaceVariables(api);

      const executor = new ApiExecutor(parsedApi);
      const response = await executor.send();

      responses.push({
        name: api.name,
        response,
      });

      if (api.name && response?.data) {
        this.variables[api.name] = response.data;
      }

      if (!response.success) break;
    }

    return responses;
  }
}

export const createApi = async (data: any, userId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      const existingApi = await Api.findOne({
        name: data.name,
        collectionId: data.collectionId,
      }).lean();

      if (existingApi) {
        return {
          error: "API already exists in this collection",
          status_code: StatusCodes.CONFLICT,
        };
      }

      const api = await Api.create({...data, createdBy: userId});
      console.log(api);
      return {
        message: "API created successfully",
        status_code: StatusCodes.CREATED,
        data: api,
      };
    },
    "DATABASE_ERROR: Failed to create API",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const getApis = async (
  collectionId: string | undefined,
  userId: string,
  sortBy: "createdAt" | "name" = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      // Build filter
      const filter: any = {};

      if (collectionId) {
        filter.collectionId = collectionId;
      }

      // 🔐 Only fetch APIs from collections owned by this user
      // Option 1: filter by collectionId ownership
      const collections = await CollectionModel.find({ createdBy: userId }).select("_id").lean();
      const userCollectionIds = collections.map(c => c._id.toString());

      // If a collectionId is provided, make sure it belongs to the user
      if (collectionId && !userCollectionIds.includes(collectionId)) {
        return {
          message: "No APIs found or access denied",
          status_code: StatusCodes.NOT_FOUND,
          data: [],
        };
      }

      const apis = await Api.find(filter)
        .populate("collectionId")
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .lean();

      return {
        message: "APIs fetched successfully",
        status_code: StatusCodes.OK,
        data: apis,
      };
    },
    "DATABASE_ERROR: Failed to fetch APIs",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const getApiById = async (apiId: string, userId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      // Fetch the API and populate its collection
      const api = await Api.findById(apiId).populate("collectionId").lean();

      if (!api) {
        return {
          error: "API not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      // 🔐 Ownership check: only allow access if user owns the collection
      if (!api.createdBy || api.createdBy.toString() !== userId) {
        return {
          error: "Access denied",
          status_code: StatusCodes.FORBIDDEN,
        };
      }

      return {
        message: "API fetched successfully",
        status_code: StatusCodes.OK,
        data: api,
      };
    },
    "DATABASE_ERROR: Failed to fetch API",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const cloneApi = async (
  apiId: string,
  collectionId: string,
  name: string,
  userId: string
) => {
  await dbConnection();
  if (!mongoose.Types.ObjectId.isValid(apiId)) {
    return generateResponseObject({ error: "Invalid API ID", status_code: StatusCodes.BAD_REQUEST });
  }
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    return generateResponseObject({ error: "Invalid collection ID", status_code: StatusCodes.BAD_REQUEST });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return generateResponseObject({ error: "access denied not authorized", status_code: StatusCodes.UNAUTHORIZED });
  }

  const result = await asyncRequestHandler(
    async () => {
      // 1 Fetch source API and populate collection
      const api = await Api.findById(apiId)
        .populate("collectionId")
        .lean();

      if (!api) {
        return {
          error: "Source API not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      
      // 2️ Ownership check: user must own the source collection
      if (!api.createdBy || api.createdBy.toString() !== userId) {
        return {
          error: "Access denied to source API",
          status_code: StatusCodes.FORBIDDEN,
        };
      }


      // 3️ Check if target collection belongs to user
      const targetCollection = await CollectionModel.findById(collectionId).lean();
      if (!targetCollection || targetCollection.createdBy.toString() !== userId) {
        return {
          error: "Target collection not found or access denied",
          status_code: StatusCodes.FORBIDDEN,
        };
      }

      // 4️ Check if API with the same name already exists in target collection
      const existingApi = await Api.findOne({
        collectionId,
        name,
      }).lean();

      if (existingApi) {
        return {
          error: "An API with this name already exists in the target collection",
          status_code: StatusCodes.CONFLICT,
        };
      }

      const { _id, ...apiWithoutId } = api;

      const newApiData = {
        ...apiWithoutId,
        collectionId,
        name,
        apiData: {...api.apiData, name},
        createdAt: undefined,
        updatedAt: undefined,
      };

      // Remove fields that shouldn’t be copied
      delete newApiData.__v;
      console.log(newApiData);

      const clonedApi = await Api.create(newApiData);

      return {
        message: "API cloned successfully",
        status_code: StatusCodes.OK,
        data: clonedApi,
      };
    },
    "DATABASE_ERROR: Failed to clone API",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const updateApi = async (
  apiId: string,
  userId: string,
  data: Partial<IApi>
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      // Find API and ensure it belongs to a collection owned by user
      const api = await Api.findById(apiId).populate("collectionId").lean();

      if (!api) {
        return {
          error: "API not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      if (!api.createdBy || api.createdBy.toString() !== userId) {
        return {
          error: "Access denied",
          status_code: StatusCodes.FORBIDDEN,
        };
      }

      // Safe to update
      const updatedApi = await Api.findByIdAndUpdate(apiId, data, {
        new: true,
        runValidators: true,
      }).populate("collectionId").lean();

      return {
        message: "API updated successfully",
        status_code: StatusCodes.OK,
        data: updatedApi,
      };
    },
    "DATABASE_ERROR: Failed to update API",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const deleteApi = async (apiId: string, userId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      // Find API and ensure it belongs to a collection owned by user
      const api = await Api.findById(apiId).populate("collectionId").lean();
      console.log(api);
      if (!api) {
        return {
          error: "API not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      if (!api.createdBy || api.createdBy.toString() !== userId) {
        return {
          error: "Access denied",
          status_code: StatusCodes.FORBIDDEN,
        };
      }

      await Api.findByIdAndDelete(apiId);

      return {
        message: "API deleted successfully",
        status_code: StatusCodes.OK,
      };
    },
    "DATABASE_ERROR: Failed to delete API",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const sendApi = async (data: IApiDocument) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {

      // SINGLE API EXECUTION
      if (data.reqType === "single") {
        const executor = new ApiExecutor(data.apiData as IApi);
        const response = await executor.send();

        return {
          status_code: response.status_code,
          data: response,
        };
      }

      // AUTOMATION EXECUTION
      if (data.reqType === "multi") {
        const executor = new AutomationExecutor(data.apisData as IApi[]);
        const responses = await executor.run();

        return {
          message: "Automation executed successfully",
          status_code: StatusCodes.OK,
          data: responses,
        };
      }

      return {
        error: "Invalid request type",
        status_code: StatusCodes.BAD_REQUEST,
      };
    },
    "EXECUTION_ERROR: Failed to execute API",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};