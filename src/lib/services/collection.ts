import Collection, { ICollection } from "@models/collection.model";
import { StatusCodes } from "http-status-codes";
import {
  asyncRequestHandler,
  generateResponseObject,
} from "@helpers/common.helper";
import { IResponseObject } from "@/src/lib/interfaces/api.interfaces";
import { dbConnection } from "@/src/config/dbConnection";

export const createCollection = async (data: ICollection) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      const existingCollection = await Collection.findOne({
        name: data.name,
        createdBy: data.createdBy,
      });

      if (existingCollection) {
        return {
          error: "Collection already exists for this user",
          status_code: StatusCodes.CONFLICT,
        };
      }

      const collection = new Collection(data);
      await collection.save();

      return {
        message: "Collection created successfully",
        status_code: StatusCodes.CREATED,
        data: collection,
      };
    },
    "DATABASE_ERROR: Failed to create collection",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const getCollections = async (userId?: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      const filter: Record<string, any> = {};
      if (userId) {
        filter.createdBy = userId;
      }

      const collections = await Collection.find(filter)
        .populate("createdBy")
        .sort({ createdAt: -1 });

      return {
        message: "Collections fetched successfully",
        status_code: StatusCodes.OK,
        data: collections,
      };
    },
    "DATABASE_ERROR: Failed to fetch collections",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const getCollectionById = async (collectionId: string, userId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      const collection = await Collection.findOne({
        _id: collectionId,
        createdBy: userId, 
      }).populate("createdBy");

      if (!collection) {
        return {
          error: "Collection not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      return {
        message: "Collection fetched successfully",
        status_code: StatusCodes.OK,
        data: collection,
      };
    },
    "DATABASE_ERROR: Failed to fetch collection",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const updateCollection = async (
  collectionId: string,
  userId: string,
  data: Partial<ICollection>
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      const updatedCollection = await Collection.findOneAndUpdate(
        { _id: collectionId, createdBy: userId }, 
        data,
        { new: true }
      );

      if (!updatedCollection) {
        return {
          error: "Collection not found or access denied",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      return {
        message: "Collection updated successfully",
        status_code: StatusCodes.OK,
        data: updatedCollection,
      };
    },
    "DATABASE_ERROR: Failed to update collection",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};

export const deleteCollection = async (collectionId: string, userId: string) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async () => {
      const collection = await Collection.findOne({
        _id: collectionId,
        createdBy: userId,
      });

      if (!collection) {
        return {
          error: "Collection not found or access denied",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      await collection.deleteOne(); 

      return {
        message: "Collection deleted successfully",
        status_code: StatusCodes.OK,
      };
    },
    "DATABASE_ERROR: Failed to delete collection",
    StatusCodes.INTERNAL_SERVER_ERROR
  ) as IResponseObject;

  return generateResponseObject(result);
};