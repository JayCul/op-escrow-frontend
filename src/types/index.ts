import type { Party } from "@/components/escrows/DetailCard";

export interface User {
  _id: string;
  email: string;
  walletAddress?: string;
  authProvider: "local" | "google" | "github" | "metamask";
  isVerified: boolean;
  displayName: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Escrow {
  _id: string;
  escrowId: number;
  buyer: Party;
  seller: Party;
  arbiter: Party;
  amount: string;
  token: string;
  status:
    | "pending"
    | "funded"
    | "completed"
    | "refunded"
    | "disputed"
    | "cancelled";
  transactionHash?: string;
  releaseTransactionHash?: string;
  refundTransactionHash?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
  proofURI?: string;
  proofSubmittedAt?: string;
  receiptConfirmed: boolean;
  receiptConfirmedAt?: string;
}

export interface Transaction {
  _id: string;
  escrowId: string;
  txHash: string;
  action: "create" | "release" | "refund" | "dispute";
  from: string;
  to: string;
  amount: string;
  status: "pending" | "confirmed" | "failed";
  blockNumber?: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ViewProofResponseDto {
  proofURI: string;
  escrowId: number;
  submittedBy: {
    id: string;
    displayName: string;
    email: string;
  };
  submittedAt: string;
  source?: string;
}

export interface UploadProofRequest {
  proofURI: string;
  description?: string;
}

export interface ConfirmReceiptRequest {
  confirmed: boolean;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
