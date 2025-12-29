import { apiClient } from "./api.client";
import type {
  Escrow,
  Transaction,
  PaginatedResponse,
  User,
  ViewProofResponseDto,
  ResetPasswordResponse,
  ForgotPasswordResponse,
} from "../types";

export const escrowsService = {
  getEscrows: (
    filters?: { status?: string; sortBy?: string; sortOrder?: string },
    page?: number,
    limit?: number
  ) =>
    apiClient.get<PaginatedResponse<Escrow>>("/escrows", {
      params: {
        ...filters,
        page,
        limit,
      },
    }),
  // Get escrow by ID
  getEscrow: (id: string) => apiClient.get<Escrow>(`/escrows/${id}`),

  // Create new escrow
  createEscrow: (data: {
    buyer: string;
    seller: string;
    amount: number;
    token: string;
    description?: string;
  }) => apiClient.post<Escrow>("/escrows", data),

  // Release funds - buyer or arbiter can call this
  releaseFunds: (escrowId: number) =>
    apiClient.post(`/escrows/${escrowId}/release`, {}),

  // Refund buyer - seller or arbiter can call this
  refundBuyer: (escrowId: number) =>
    apiClient.post(`/escrows/${escrowId}/refund`, {}),

  // Raise dispute - buyer or seller can call this
  // raiseDispute: (escrowId: number, reason?: string) =>
  //   apiClient.post(`/escrows/${String(escrowId)}/dispute`, { reason }),

  raiseDispute: ({
    escrowId,
    reason,
  }: {
    escrowId: number;
    reason?: string;
  }) => {
    return apiClient.post(`/escrows/${escrowId}/dispute`, { reason });
  },

  // Upload proof of shipment - seller only
  uploadProof: (
    escrowId: number,
    data: {
      proofURI: string;
      description?: string;
    }
  ) => apiClient.post(`/escrows/${escrowId}/proof`, data),

  // View proof - anyone involved can view
  viewProof: (escrowId: number) =>
    apiClient.get<ViewProofResponseDto>(`/escrows/${escrowId}/proof`),

  // Confirm receipt - buyer only
  confirmReceipt: (escrowId: number, transactionHash: string) =>
    apiClient.post(`/escrows/receipt`, {
      escrowId,
      transactionHash,
    }),

  // Get escrow transactions
  getTransactions: (escrowId: string) =>
    apiClient.get<Transaction[]>(`/escrows/${escrowId}/transactions`),
};

export const usersService = {
  // Search users
  searchUsers: ({ searchTerm }: { searchTerm: string }) =>
    apiClient.get(`/users/searchAll`, {
      params: { q: searchTerm },
    }),

  getAll: () => apiClient.get<User[]>("/users"),

  // Get user profile
  getProfile: () => apiClient.get<User>("/users/profile"),

  // Update profile
  updateProfile: (data: Partial<User>) =>
    apiClient.put<User>("/users/profile", data),

  // Get user suggestions
  getSuggestions: (limit?: number) =>
    apiClient.get<User[]>(`/users/suggestions?limit=${limit || 20}`),
};

export const authService = {
  // Login with email/password
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ user: User; accessToken: string; refreshToken: string }>(
      "/auth/login",
      credentials
    ),

  // Register new user
  register: (data: {
    email: string;
    password?: string;
    walletAddress?: string;
    authProvider: string;
    displayName: string;
  }) =>
    apiClient.post<{ user: User; accessToken: string; refreshToken: string }>(
      "/auth/register",
      data
    ),

  // MetaMask login
  getNonce: (data: { walletAddress: string }) =>
    apiClient.post<{ nonce: string | null }>("/auth/nonce", data),

  metamaskLogin: (data: { walletAddress: string; signature: string }) =>
    apiClient.post<{ user: User; accessToken: string; refreshToken: string }>(
      "/auth/metamask",
      data
    ),

  // Logout
  logout: () => apiClient.post("/auth/logout"),

  // Forgot password
  forgotPassword: (email: string) =>
    apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", { email }),

  // Reset password
  resetPassword: (data: { token: string; newPassword: string }) =>
    apiClient.post<ResetPasswordResponse>("/auth/reset-password", data),
};
