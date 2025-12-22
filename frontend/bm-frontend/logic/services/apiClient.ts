import axios from "axios";
import { TokenService } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================
// REQUEST: attach token
// ==========================
api.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken(); // ✅ Using Utility
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// RESPONSE: handle 401 & REFRESH
// ==========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/accounts/token/') // Don't refresh if the login itself fails
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenService.getRefreshToken(); // ✅ Using Utility
        if (!refreshToken) throw new Error("No refresh token");

        // We use a clean axios instance to avoid interceptor loops
        const res = await axios.post(`${API_URL}/accounts/token/refresh/`, {
          refresh: refreshToken,
        });

        if (res.status === 200) {
          const newAccess = res.data.access;
          TokenService.updateAccessToken(newAccess); // ✅ Syncing global storage

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        TokenService.clear(); // ✅ Clear everything on failure
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;