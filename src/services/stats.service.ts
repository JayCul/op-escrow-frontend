import { apiClient } from "./api.client";

export const statsService = {
  // Get formatted stats for dashboard
  getFormattedStats: () => apiClient.get("/stats/dashboard/formatted"),

  // Get raw stats data
  getRawStats: () => apiClient.get("/stats/dashboard"),

  // Refresh stats (if you have a dedicated refresh endpoint)
  refreshStats: () => apiClient.post("/stats/refresh"),
};
