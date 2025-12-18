import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const api = axios.create({
  baseURL: API_URL.endsWith("/")
    ? API_URL
    : API_URL + "",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================
// REQUEST: attach token
// ==========================
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// RESPONSE: handle 401
// ==========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401
    ) {
      // 🔴 SESSION EXPIRED
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      // Prevent infinite redirect loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
