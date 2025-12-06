import {
  BASE_URL,
  shopifyBaseUrl,
  STRAPI_URL,
  wixBaseUrl,
} from "@/constant";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getStoreId, removeAllCookies } from "./cookies";

// const accessToken = getToken();
// in-memory storage for access token
let accessToken: string | null = null;
// const storeId = getStoreId();

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Create a variable to store the refresh promise
let refreshTokenPromise: any = null;

// Function to refresh token that ensures only one refresh happens at a time
const refreshTokenSingleton = async () => {
  // If there's already a refresh in progress, return that promise
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  // Otherwise, create a new refresh promise
  refreshTokenPromise = axios
    .get(`${BASE_URL}/auth/refresh`, { withCredentials: true })
    .then((response) => {
      // Set the new access token
      const newAccessToken = response.data.data.accessToken;
      setAccessToken(newAccessToken);
      return newAccessToken;
    })
    .finally(() => {
      // Clear the promise so future calls can create a new one
      refreshTokenPromise = null;
    });

  return refreshTokenPromise;
};

if (!accessToken) {
  (async () => {
    try {
      await refreshTokenSingleton();
    } catch (err) {}
  })();
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-store-id": "113947194574972928",
  },
  withCredentials: true,
});

export const shopifyApi = axios.create({
  baseURL: shopifyBaseUrl,
  headers: {
    "Content-Type": "application/json",
    // "x-store-id": getStoreId(),
  },
  withCredentials: true,
});

export const wixApi = axios.create({
  baseURL: wixBaseUrl,
  headers: {
    "Content-Type": "application/json",
    // "x-store-id": getStoreId(),
  },
  withCredentials: true,
});

export const amazonSchemaApi = axios.create({
  // baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // "x-store-id": getStoreId(),
  },
});

export const loginApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // "x-store-id": getStoreId(),
  },
  withCredentials: true,
});

export const support = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    "Content-Type": "application/json",
    // "x-store-id": getStoreId(),
  },
  withCredentials: true,
});

const requestConfig = (config: InternalAxiosRequestConfig<any>) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    config.headers["x-store-id"] = "113947194574972928";
  }
  return config;
};
const requestError = (error: any) => Promise.reject(error);

const responseConfig = (response: AxiosResponse<any, any>) => {
  // Modify response data here, if needed
  return response;
};

const responseError = async (error: any) => {
  const originalRequest = error.config;

  // If error is 401 (Unauthorized) and we haven't tried to refresh yet
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      // Get a new token using our singleton function
      const newAccessToken = await refreshTokenSingleton();

      // Update the failed request's authorization header
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // Handle refresh token failure (e.g., redirect to login)
      // Clear the access token
      // setAccessToken(null);
      const pathname = window.location.pathname;

      if (pathname.indexOf("/auth/") !== 0) {
        removeAllCookies();
        window.location.href = "/auth/login";
      }

      // You might want to redirect to login or dispatch a logout action here
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
};

api.interceptors.request.use(requestConfig, requestError);
api.interceptors.response.use(responseConfig, responseError);

// shopify interceptors
shopifyApi.interceptors.request.use(requestConfig, requestError);
shopifyApi.interceptors.response.use(responseConfig, responseError);

// wix interceptors
wixApi.interceptors.request.use(requestConfig, requestError);
wixApi.interceptors.response.use(responseConfig, responseError);

export const anotherAPi = api;

export const supportApi = support;

export const coreApi = api;

export const kycApi = api;

export const productApi = api;

export const paymentIntegrationApi = api;

export const analyticsApi = api;

export const auditLogApi = api;

export const ticketApi = axios.create({
  baseURL: "http://192.168.29.176:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

export const ondcApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // "ngrok-skip-browser-warning": "69420",
  },
});

ondcApi.interceptors.request.use(requestConfig, requestError);
ondcApi.interceptors.response.use(responseConfig, responseError);

export const updateApiHeaders = () => {
  // api.defaults.headers.Authorization = `Bearer ${getToken()}`;
  // api.defaults.headers["x-store-id"] = getStoreId() ?? "";
  // anotherAPi.defaults.headers.Authorization = `Bearer ${getToken()}`;
  // anotherAPi.defaults.headers["x-store-id"] = getStoreId() ?? "";
  // coreApi.defaults.headers.Authorization = `Bearer ${getToken()}`;
  // coreApi.defaults.headers["x-store-id"] = getStoreId() ?? "";
  // productApi.defaults.headers.Authorization = `Bearer ${getToken()}`;
  // productApi.defaults.headers["x-store-id"] = getStoreId() ?? "";
  // analyticsApi.defaults.headers.Authorization = `Bearer ${getToken()}`;
  // analyticsApi.defaults.headers["x-store-id"] = getStoreId() ?? "";
  // ondcApi.defaults.headers.Authorization = `Bearer ${getToken()}`;
  // ondcApi.defaults.headers["x-store-id"] = getStoreId() ?? "";
  // razorPayApi.defaults.headers.Authorization = `Bearer ${getToken()}`;
  // razorPayApi.defaults.headers["x-store-id"] = getStoreId() ?? "";
  // auditLogApi.defaults.headers.Authorization = `Bearer ${getToken()}`;
  // auditLogApi.defaults.headers["x-store-id"] = getStoreId() ?? "";
};
