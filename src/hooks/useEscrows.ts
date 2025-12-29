/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { escrowsService } from "@/services/escrows.service";
import { toast } from "sonner";
import type { PaginatedResponse, Escrow } from "@/types";

// Enhanced version with sorting options
interface UseEscrowsOptions {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UseEscrowsReturn {
  // Query data
  escrows: Escrow[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;

  // Mutations
  createEscrow: (data: any) => void;
  releaseFunds: (data: any) => void;
  refundBuyer: (data: any) => void;
  raiseDispute: (data: any) => void;
  uploadProof: (variables: {
    escrowId: number;
    data: { proofURI: string; description?: string };
  }) => void;
  confirmReceipt: (escrowId: number) => void;
  useViewProof: (escrowId: number) => any;

  // Loading states
  isCreating: boolean;
  isReleasing: boolean;
  isRefunding: boolean;
  isDisputing: boolean;
  isUploadingProof: boolean;
  isConfirmingReceipt: boolean;
}

export const useEscrows = (
  options: UseEscrowsOptions = {}
): UseEscrowsReturn => {
  const {
    status,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const queryClient = useQueryClient();

  const filters = { status };

  const {
    data: paginatedResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Escrow>, unknown, PaginatedResponse<Escrow>>({
    queryKey: ["escrows", filters, page, limit, sortBy, sortOrder],
    queryFn: () =>
      escrowsService
        .getEscrows({ ...filters, sortBy, sortOrder }, page, limit)
        .then((res: any) => res.data as PaginatedResponse<Escrow>),
    staleTime: 30 * 1000,
    onError: (error: any) => {
      console.error("Error fetching escrows:", error);
      toast.error("Failed to load escrows");
    },
  });

  // Create escrow mutation
  const createEscrowMutation = useMutation({
    mutationFn: escrowsService.createEscrow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      toast.success("Escrow created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create escrow");
    },
  });

  // Release funds mutation
  const releaseFundsMutation = useMutation({
    mutationFn: (escrowId: number) => escrowsService.releaseFunds(escrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      toast.success("Funds released successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to release funds");
    },
  });

  // Refund buyer mutation
  const refundBuyerMutation = useMutation({
    mutationFn: (escrowId: number) => escrowsService.refundBuyer(escrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      toast.success("Buyer refunded successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to refund buyer");
    },
  });

  // Raise dispute mutation
  const raiseDisputeMutation = useMutation({
    mutationFn: escrowsService.raiseDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      toast.success("Dispute raised successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to raise dispute");
    },
  });

  // Upload proof mutation
  const uploadProofMutation = useMutation({
    mutationFn: ({
      escrowId,
      data,
    }: {
      escrowId: number;
      data: { proofURI: string; description?: string };
    }) => escrowsService.uploadProof(escrowId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      queryClient.invalidateQueries({ queryKey: ["proof"] });
      toast.success("Proof submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit proof");
    },
  });

  // Confirm receipt mutation
  const confirmReceiptMutation = useMutation({
    mutationFn: escrowsService.confirmReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      toast.success("Receipt confirmed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to confirm receipt");
    },
  });

  // View proof query - extracted to a separate hook
  const useViewProof = (escrowId: number) => {
    return useQuery({
      queryKey: ["proof", escrowId],
      queryFn: () => escrowsService.viewProof(escrowId).then((res) => res.data),
      enabled: !!escrowId,
    });
  };

  return {
    // Query data
    escrows: paginatedResponse?.data || [],
    pagination: paginatedResponse
      ? {
          currentPage: paginatedResponse.currentPage,
          totalPages: paginatedResponse.totalPages,
          totalCount: paginatedResponse.totalCount,
          hasNextPage: paginatedResponse.hasNextPage,
          hasPreviousPage: paginatedResponse.hasPreviousPage,
        }
      : null,
    isLoading,
    error: error as Error | null,
    refetch,

    // Mutations
    createEscrow: createEscrowMutation.mutate,
    releaseFunds: releaseFundsMutation.mutate,
    refundBuyer: refundBuyerMutation.mutate,
    raiseDispute: raiseDisputeMutation.mutate,
    uploadProof: uploadProofMutation.mutate,
    confirmReceipt: confirmReceiptMutation.mutate,
    useViewProof,

    // Loading states
    isCreating: createEscrowMutation.isPending,
    isReleasing: releaseFundsMutation.isPending,
    isRefunding: refundBuyerMutation.isPending,
    isDisputing: raiseDisputeMutation.isPending,
    isUploadingProof: uploadProofMutation.isPending,
    isConfirmingReceipt: confirmReceiptMutation.isPending,
  };
};
