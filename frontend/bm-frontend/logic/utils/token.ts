export const TokenService = {
  getAccessToken: () => typeof window !== "undefined" ? localStorage.getItem("access") : null,
  getRefreshToken: () => typeof window !== "undefined" ? localStorage.getItem("refresh") : null,
  getUserRole: () => typeof window !== "undefined" ? localStorage.getItem("role") : null,

  setTokens: (access: string, refresh: string, role: string) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("role", role);
  },

  updateAccessToken: (access: string) => {
    localStorage.setItem("access", access);
  },

  clear: () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
  }
};