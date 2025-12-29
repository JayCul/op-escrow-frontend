// hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/stats.service";
import { FileText, TrendingUp, DollarSign, Users, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useIsAuthenticated } from "@/stores/auth.store";
import { toast } from "sonner";
import { useEffect } from "react";

export interface DashboardStats {
  label: string;
  value: string;
  icon: LucideIcon;
  change: string;
}

export interface RawStats {
  totalEscrows: number;
  activeEscrows: number;
  totalVolume: string;
  partners: number;
}

interface UseDashboardReturn {
  stats: DashboardStats[];
  rawStats: RawStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  isAuthenticated: boolean;
}

// Icon mapping for the stats
const iconMap: Record<string, LucideIcon> = {
  FileText: FileText,
  TrendingUp: TrendingUp,
  DollarSign: DollarSign,
  Users: Users,
  Plus: Plus,
};

export const useDashboard = (): UseDashboardReturn => {
  const isAuthenticated = useIsAuthenticated();

  // Get formatted dashboard stats query
  const {
    data: formattedData,
    isLoading: formattedLoading,
    error: formattedError,
    refetch: refetchFormatted,
  } = useQuery({
    queryKey: ["dashboard", "formatted"],
    queryFn: async () => {
      const response = await statsService.getFormattedStats();
      const data = response.data;

      // Transform string icons to LucideIcon components
      if (data.stats && Array.isArray(data.stats)) {
        return {
          ...data,
          stats: data.stats.map((stat: any) => ({
            ...stat,
            icon: iconMap[stat.icon] || FileText, // Fallback to FileText
          })),
        };
      }
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (formattedError) {
      console.error("Dashboard stats fetch error:", formattedError);

      // Show user-friendly error messages
      if (formattedError?.status === 401) {
        toast.error("Please log in to view dashboard statistics");
      } else if (formattedError?.status === 403) {
        toast.error("You do not have permission to view dashboard statistics");
      } else if (formattedError?.status >= 500) {
        toast.error("Server error while loading dashboard");
      } else {
        toast.error("Failed to load dashboard statistics");
      }
    }
  }, [formattedError]);

  // Get raw dashboard stats query
  const {
    data: rawData,
    isLoading: rawLoading,
    error: rawError,
    refetch: refetchRaw,
  } = useQuery({
    queryKey: ["dashboard", "raw"],
    queryFn: () => statsService.getRawStats().then((res: any) => res.data),
    enabled: isAuthenticated,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });

  // Combined refetch function
  const refetch = async () => {
    await Promise.all([refetchFormatted(), refetchRaw()]);
  };

  return {
    stats: formattedData?.stats || getDefaultStats(),
    rawStats: rawData || null,
    isLoading: formattedLoading || rawLoading,
    error: formattedError || rawError,
    refetch,
    isAuthenticated,
  };
};

// Default stats with proper Lucide icons
const getDefaultStats = (): DashboardStats[] => [
  {
    label: "Total Escrows",
    value: "0",
    icon: FileText,
    change: "+0",
  },
  {
    label: "Active Escrows",
    value: "0",
    icon: TrendingUp,
    change: "+0",
  },
  {
    label: "Total Volume",
    value: "0 ETH",
    icon: DollarSign,
    change: "+0%",
  },
  {
    label: "Partners",
    value: "0",
    icon: Users,
    change: "+0",
  },
];

// Individual stat hook
export const useStat = (statType: keyof RawStats) => {
  const { rawStats, isLoading, error, isAuthenticated } = useDashboard();

  return {
    value: rawStats?.[statType] || 0,
    isLoading,
    error,
    isAuthenticated,
  };
};
