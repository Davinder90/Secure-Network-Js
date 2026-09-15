import axios from "axios";
import { getLocalStorage } from "../localStorage";

const axiosInstance = axios.create({
  baseURL: ``,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log(
      `[Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );

    const userInfo = getLocalStorage("userInfo");
    if (userInfo?.access_token) {
      config.headers.Authorization = `Bearer ${userInfo.access_token}`;
    }

    return config;
  },
  (error) => {
    console.error("[Request Error]", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `[Response] ${response.status} ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      "[Response Error]",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default axiosInstance;
