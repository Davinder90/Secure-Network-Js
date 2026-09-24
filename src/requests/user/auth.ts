import jsAxiosInstance from "@/src/lib/helpers/axios.helpers/js.axios.helpers";
import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper";
import { JS_SERVER_PATHS } from "@/src/lib/utils/constants";
import { AxiosResponse } from "axios";

export const handleGetUserAuthToken = async (body: object) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.post(
      JS_SERVER_PATHS.USER_LOGIN,
      body
    )
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleCreateUserAccount = async (body: object) => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.post(
      JS_SERVER_PATHS.USER_REGISTER,
      body
    )
  ) as AxiosResponse;
  return handleResponse(result);
};


export const handleGetUserAllowance = async () => {
  const result = await asyncResponseHandler(() =>{
    return jsAxiosInstance.get(JS_SERVER_PATHS.USER_GET_ALLOWANCE)
  }
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleGetUserProfile = async (page: number = 1, limit: number = 5) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(`${JS_SERVER_PATHS.USER_PROFILE}?page=${page}&limit=${limit}`)
  )) as AxiosResponse;
  return handleResponse(result);
};

export const handleChangeProfilePassword = async (body: Record<string, string>) => {
  const result = await asyncResponseHandler(() =>{
    return jsAxiosInstance.post(JS_SERVER_PATHS.CHANGE_PASSWORD, body)
  }
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleUpdateUserProfile = async (data: object) => {
  const result = await asyncResponseHandler(() =>{
    return jsAxiosInstance.put(JS_SERVER_PATHS.UPDATE_PROFILE, data)
  }
  ) as AxiosResponse;
  return handleResponse(result);
};

export const handleIsAdmin = async () => {
  const result = await asyncResponseHandler(() =>
    jsAxiosInstance.get(JS_SERVER_PATHS.IS_ADMIN)
  ) as AxiosResponse;
  return handleResponse(result);
}

