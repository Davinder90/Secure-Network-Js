import axios from "axios";
import { getLocalStorage } from "../localStorage";
import { env_var } from "@config/env.config";

const pythonAxiosInstance = axios.create({
  baseURL: `${env_var.PYTHON_BACKEND_URL}:${env_var.PYTHON_BACKEND_PORT}`,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

pythonAxiosInstance.interceptors.request.use(
  (config) => {
    // console.log(
    //   `[PY Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    // );

    const userInfo = getLocalStorage("userInfo");
    if (userInfo?.access_token) {
      config.headers.Authorization = `Bearer ${userInfo.access_token}`;
    }

    return config;
  },
  (error) => {
    console.error("[PY Request Error]", error);
    return Promise.reject(error);
  }
);

pythonAxiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      // `[PY Response] ${response.status} ${response.config.url}`
    );
    return response;
  },
  (error) => {
    // console.error(
    //   "[PY Response Error]",
    //   error.response?.data || error.message
    // );
    return Promise.reject(error);
  }
);

export default pythonAxiosInstance;
