import { AxiosResponse } from "axios";
import jsAxiosInstance from "@/src/lib/helpers/axios.helpers/js.axios.helpers";
import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper";
import { JS_SERVER_PATHS } from "@/src/lib/utils/constants";
import { ICollection } from "@/src/models/collection.model";


export const handleGetCollections = async (userId?: string) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.GET_COLLECTIONS, { params: { userId } })
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleGetCollectionById = async (collectionId: string) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.GET_COLLECTION_BY_ID, { params: { collectionId } })
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleCreateCollection = async (data: ICollection) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.post(JS_SERVER_PATHS.CREATE_COLLECTION, data)
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleUpdateCollection = async (data: ICollection) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.put(JS_SERVER_PATHS.UPDATE_COLLECTION, data )
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleDeleteCollection = async (collectionId: string) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.delete(JS_SERVER_PATHS.DELETE_COLLECTION, { data: { collectionId } })
  ) as AxiosResponse;
  return handleResponse(result);
};