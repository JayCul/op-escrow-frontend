import React from "react";
import {
  X,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { weiToEth, getTokenSymbol } from "@/utils/tokenUtils";

export interface Party {
  _id: string;
  email: string;
  walletAddress: string;
  displayName: string;
}

interface EscrowDetail {
  escrowId: number;
  buyer: Party;
  seller: Party;
  arbiter: Party;
  amount: string;
  token: string;
  status: string;
  proofURI?: string;
  transactionHash?: string;
  receiptConfirmed: boolean;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface DetailCardProps {
  escrow: EscrowDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusStyles: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending: { label: "Pending", color: "text-yellow-500", icon: Clock },
  funded: { label: "Funded", color: "text-blue-500", icon: CheckCircle },
  completed: { label: "Completed", color: "text-green-500", icon: CheckCircle },
  refunded: { label: "Refunded", color: "text-purple-500", icon: CheckCircle },
  disputed: { label: "Disputed", color: "text-red-500", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "text-gray-400", icon: X },
};

export const DetailCard: React.FC<DetailCardProps> = ({
  escrow,
  isOpen,
  onClose,
}) => {
  if (!escrow) return null;

  const status = statusStyles[escrow.status];
  const StatusIcon = status.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Escrow #{escrow.escrowId}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIcon className={cn("h-4 w-4", status.color)} />
                  <span className={cn("text-sm font-medium", status.color)}>
                    {status.label}
                  </span>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Amount */}
            <div className="mb-6 rounded-lg border p-4 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-muted-foreground mb-1">
                Escrow Amount
              </div>
              <div className="text-2xl font-bold">
                {weiToEth(escrow.amount)} {getTokenSymbol(escrow.token)}
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                ["Buyer", escrow.buyer],
                ["Seller", escrow.seller],
                ["Arbiter", escrow.arbiter],
              ].map(([label, party]: any) => (
                <div
                  key={label}
                  className="rounded-lg border p-3 bg-white dark:bg-gray-800"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {label}
                  </div>
                  <div className="font-medium">{party.displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {party.walletAddress}
                  </div>
                  <div className="text-xs mt-1">{party.email}</div>
                </div>
              ))}
            </div>

            {/* Transaction */}
            <div className="mb-6 grid grid-cols-2 gap-2 justify-between">
              {escrow.transactionHash && (
                <div className="">
                  <div className="text-sm text-muted-foreground mb-1">
                    Blockchain Transaction
                  </div>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${escrow.transactionHash}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    View on Etherscan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {escrow.proofURI && (
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                      Proof Uploaded
                    </h4>
                  </div>

                  <p className="text-sm text-emerald-700 dark:text-emerald-300 break-all">
                    {escrow.proofURI}
                  </p>
                </div>
              )}
            </div>

            {/* Dispute */}
            {escrow.status === "disputed" && escrow.disputeReason && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium text-sm">Dispute Reason</span>
                </div>
                <p className="text-sm">{escrow.disputeReason}</p>
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <div>Created</div>
                <div className="font-medium">
                  {new Date(escrow.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div>Last Updated</div>
                <div className="font-medium">
                  {new Date(escrow.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
