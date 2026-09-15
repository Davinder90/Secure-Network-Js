import axios from "axios";
import { getLocalStorage } from "../localStorage";

const jsAxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

jsAxiosInstance.interceptors.request.use(
  (config) => {
    // console.log(`[JS Request] ${config.method?.toUpperCase()} ${config.url}`);
    const userInfo = getLocalStorage("sn-userInfo");
    if (userInfo?.access_token) {
      config.headers.Authorization = `Bearer ${userInfo.access_token}`;
    }
    return config;
  },
  (error) => {
    // console.error("[JS Request Error]", error);
    return Promise.reject(error);
  }
);

jsAxiosInstance.interceptors.response.use(
  (response) => {
    // console.log(`[JS Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // console.error(
    //   "[JS Response Error]",
    //   error.response?.data || error.message
    // );
    return Promise.reject(error);
  }
);

export default jsAxiosInstance;
