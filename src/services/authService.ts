import apiService from "./apiService";
import { clearAuthSession, setAuthToken } from "./authSession";

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user?: Record<string, unknown>;
};

export const sendLogin = async (payload: LoginPayload) => {
  const response = await apiService.post<LoginResponse, LoginPayload>(
    "/login",
    payload,
  );

  setAuthToken(response.access_token);
  return response;
};

export const logout = () => {
  clearAuthSession();
};
