import axios from "axios";

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
// RESPONSE: handle 401 & REFRESH
// ==========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't tried to refresh yet
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) throw new Error("No refresh token");

        // TEACHING POINT: We use raw 'axios' here, NOT our 'api' instance.
        // If we used 'api', we might trigger an infinite loop of 401s.
        const res = await axios.post(`${API_URL}/accounts/token/refresh/`, {
          refresh: refreshToken,
        });

        if (res.status === 200) {
          const newAccess = res.data.access;
          localStorage.setItem("access", newAccess);

          // Update the failed request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refreshing fails (e.g., refresh token expired too), log out
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;