import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, FileText } from "lucide-react";
import { useEscrows } from "@/hooks/useEscrows";
import { Button } from "@/components/ui/Button";
import { EscrowCard } from "@/components/escrows/EscrowCard";
import { CreateEscrowModal } from "@/components/escrows/CreateEscrowModal";
import { useDashboard } from "@/hooks/useDashboard";
import { useUser } from "@/stores/auth.store";
import type { Escrow } from "@/types";

export const Dashboard: React.FC = () => {
  const user = useUser();
  const [currentPage] = useState(1);
  const {
    escrows,
    isLoading,
    // error: escrowsError,
    // refetch,
  } = useEscrows({
    page: currentPage,
    limit: 99,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // const stats = [
  //   { label: "Total Escrows", value: "12", icon: FileText, change: "+2" },
  //   { label: "Active Escrows", value: "8", icon: TrendingUp, change: "+1" },
  //   {
  //     label: "Total Volume",
  //     value: "$24,580",
  //     icon: DollarSign,
  //     change: "+12%",
  //   },
  //   { label: "Partners", value: "24", icon: Users, change: "+3" },
  // ];
  const { stats, isLoading: dashloading } = useDashboard();

  if (!user) return null;
  if (dashloading) {
    return (
      <div
        className="
          min-h-screen flex items-center justify-center
          
        "
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 dark:from-[#0b132b] dark:via-[#1c2541] dark:to-[#3a506b]" />

      {/* Content Wrapper */}
      <div className="px-6 sm:px-10 lg:px-16 py-10 space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {user.displayName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Here's what's happening with your escrows today.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            isLoading={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Escrow
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-500 mt-1">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Escrows */}
        <div className="text-gray-900 dark:text-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold ">Recent Escrows</h2>
            <Button variant="outline">View All</Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 animate-pulse"
                >
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4" />
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4" />
                  <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {escrows.map((escrow: Escrow) => (
                <EscrowCard
                  key={escrow._id}
                  escrow={escrow}
                  currentUserId={user._id}
                />
              ))}
            </motion.div>
          )}

          {escrows.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No escrows yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first escrow to get started with secure
                transactions.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Escrow
              </Button>
            </motion.div>
          )}
        </div>

        {/* Create Escrow Modal */}
        <CreateEscrowModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
};
