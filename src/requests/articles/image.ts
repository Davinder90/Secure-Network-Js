import jsAxiosInstance from "@/src/lib/helpers/axios.helpers/js.axios.helpers";
import {
  asyncResponseHandler,
  handleResponse,
} from "@/src/lib/helpers/ui/common.helper";
import { JS_SERVER_PATHS } from "@/src/lib/utils/constants";
import { AxiosResponse } from "axios";

/**
 * Uploads a brand new image using FormData.
 */
export const handleUploadImage = async (formData: FormData, username: string) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.post(
      `${JS_SERVER_PATHS.UPLOAD_IMAGE}?username=${encodeURIComponent(username || "user")}`,
      formData,
      {
        headers: {
          // 💡 CRITICAL: Overrides the instance's default "application/json"
          // Setting it to undefined tells Axios/Browser to set multipart/form-data with boundary!
          "Content-Type": undefined,
        },
      }
    )
  )) as AxiosResponse;

  return handleResponse(result);
};

/**
 * Replaces an existing image by deleting previousFilename and uploading the new file.
 */
export const handleReplaceImage = async (
  formData: FormData,
  username: string,
  previousFilename: string
) => {
  const query = new URLSearchParams({
    username: username || "user",
    previousFilename: previousFilename || "",
  });

  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.put(
      `${JS_SERVER_PATHS.REPLACE_IMAGE}?${query.toString()}`,
      formData,
      {
        headers: {
          // 💡 CRITICAL: Overrides the instance's default "application/json"
          "Content-Type": undefined,
        },
      }
    )
  )) as AxiosResponse;

  return handleResponse(result);
};

/**
 * Deletes an image from storage by filename.
 */
export const handleDeleteImage = async (filename: string) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.delete(
      `${JS_SERVER_PATHS.DELETE_IMAGE}?filename=${encodeURIComponent(filename)}`
    )
  )) as AxiosResponse;

  return handleResponse(result);
};

/**
 * Fetches image data by filename.
 */
export const handleGetImage = async (filename: string) => {
  const result = (await asyncResponseHandler(() =>
    jsAxiosInstance.get(
      `${JS_SERVER_PATHS.GET_IMAGE}?filename=${encodeURIComponent(filename)}`
    )
  )) as AxiosResponse;

  return handleResponse(result);
};
