import axios, { type AxiosRequestConfig, type Method } from "axios";
import { clearAuthSession, getAuthToken } from "./authSession";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  },
);

export const apiRequest = async <TResponse = unknown, TData = unknown>(
  method: Method,
  url: string,
  data?: TData,
  config?: AxiosRequestConfig,
) => {
  const response = await apiClient.request<TResponse>({
    method,
    url,
    data,
    ...config,
  });

  return response.data;
};

export const apiService = {
  get: <TResponse = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<TResponse>("get", url, undefined, config),

  post: <TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig,
  ) => apiRequest<TResponse, TData>("post", url, data, config),

  put: <TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig,
  ) => apiRequest<TResponse, TData>("put", url, data, config),

  patch: <TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig,
  ) => apiRequest<TResponse, TData>("patch", url, data, config),

  delete: <TResponse = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<TResponse>("delete", url, undefined, config),
};

export default apiService;
