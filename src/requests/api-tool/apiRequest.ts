import { ApiDocumentWithOptionalId } from "@/src/app/api-tools/page";
import jsAxiosInstance from "@/src/lib/helpers/axios.helpers/js.axios.helpers";
import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper";
import { JS_SERVER_PATHS } from "@/src/lib/utils/constants";
import { IApi } from "@/src/models/api.model";
import { AxiosResponse } from "axios";

export const handleGetApis = async (collectionId?: string) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.GET_APIS, { params: { collectionId } })
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleGetApiById = async (apiId: string) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.GET_API_BY_ID, { params: { apiId } })
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleCreateApi = async (data: ApiDocumentWithOptionalId) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.post(JS_SERVER_PATHS.CREATE_API, data)
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleUpdateApi = async (data: ApiDocumentWithOptionalId) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.put(JS_SERVER_PATHS.UPDATE_API, data )
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleDeleteApi = async (apiId: string) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.delete(JS_SERVER_PATHS.DELETE_API, { data: { apiId } })
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleCloneApi = async (data: {apiId: string, collectionId: string, name: string}) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.post(JS_SERVER_PATHS.CLONE_API, data)
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleSendApi = async (data: ApiDocumentWithOptionalId) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.post(JS_SERVER_PATHS.SEND_API, data)
  ) as AxiosResponse;
  return handleResponse(result);
};