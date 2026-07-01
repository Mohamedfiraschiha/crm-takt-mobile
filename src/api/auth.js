import { apiClient } from "./client";

// Backend: POST /api/auth/signin -> { success, requiresTwoFactor, data: { user, token } }
export const signin = async (email, password) => {
  const { data } = await apiClient.post("/api/auth/signin", {
    email,
    password,
  });
  return data;
};

// Backend: POST /api/2fa/verify-login -> { success, data: { user, token } }
export const verifyTwoFactorLogin = async (userId, token) => {
  const { data } = await apiClient.post("/api/2fa/verify-login", {
    userId,
    token,
  });
  return data;
};

// Backend: GET /api/auth/me -> { success, data: { user } }
export const getMe = async () => {
  const { data } = await apiClient.get("/api/auth/me");
  return data.data.user;
};
