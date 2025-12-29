import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if this is a refresh token request to avoid infinite loop
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    console.log("API error response from client:", error.response);
    console.log("API text from client:", !originalRequest._retry);

    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await apiClient.post("/auth/refresh", {
            refreshToken,
          });
          const { accessToken } = response.data;

          sessionStorage.setItem("accessToken", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return apiClient(originalRequest);
        }
      } catch (refreshError: any) {
        // Refresh token failed, logout user
        console.error("Token refresh failed:", refreshError);
        toast.error("An error occured while trying to refresh your token.");
        if (refreshError?.message === "Request failed with status code 500") {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          sessionStorage.removeItem("user");

          toast.success("Logged out successfully");

          // useNavigate()("/login");
        }
        // sessionStorage.removeItem("accessToken");
        // sessionStorage.removeItem("refreshToken");
      }
    }

    return Promise.reject(error);
  }
);
