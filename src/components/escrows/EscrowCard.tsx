import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Copy,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  PackageCheck,
  Upload,
} from "lucide-react";
import type { Escrow } from "@/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { useEscrows } from "@/hooks/useEscrows";
import { toast } from "sonner";
import { UploadProofModal } from "./UploadProofModal";
import { weiToEth, getTokenSymbol, useWeiToUsd } from "@/utils/tokenUtils";
import { DetailCard } from "./DetailCard";
import { useConfirmReceipt } from "@/hooks/useConfirmReceipt";

interface EscrowCardProps {
  escrow: Escrow;
  currentUserId: string;
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  funded: { label: "Funded", color: "bg-blue-500", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  refunded: { label: "Refunded", color: "bg-purple-500", icon: CheckCircle },
  disputed: { label: "Disputed", color: "bg-red-500", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "bg-gray-500", icon: XCircle },
};

export const EscrowCard: React.FC<EscrowCardProps> = ({
  escrow,
  currentUserId,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { mutate: confirmReceipt, isPending } = useConfirmReceipt();
  const {
    releaseFunds,
    refundBuyer,
    raiseDispute,
    uploadProof,
    useViewProof,
    isReleasing,
    isRefunding,
    isDisputing,
    isUploadingProof,
  } = useEscrows();

  const [showUploadProof, setShowUploadProof] = useState(false);

  const handleSubmitProof = () => {
    setShowUploadProof(true);
  };
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const { data: proof } = useViewProof(escrow.escrowId);

  const StatusIcon = statusConfig[escrow.status].icon;
  const statusColor = statusConfig[escrow.status].color;

  const { usdAmount } = useWeiToUsd(escrow.amount);

  const isSeller = useMemo(
    () => escrow.seller._id === currentUserId,
    [escrow.seller._id, currentUserId]
  );

  const isBuyer = useMemo(
    () => escrow.buyer._id === currentUserId,
    [escrow.buyer._id, currentUserId]
  );

  const isArbiter = useMemo(
    () => escrow.arbiter._id === currentUserId,
    [escrow.arbiter._id, currentUserId]
  );

  useEffect(() => {
    console.log("EscrowCard Mounted:", escrow);
    console.log("EscrowCard Mounted:", isArbiter);
  }, [escrow]);

  const canRelease =
    (escrow.status === "funded" || escrow.status === "disputed") &&
    (isBuyer || isArbiter);
  const canRefund =
    (escrow.status === "funded" || escrow.status === "disputed") &&
    (isSeller || isArbiter);
  const canDispute =
    ["pending", "funded"].includes(escrow.status) && (isBuyer || isSeller);

  const canSubmitProof =
    isSeller &&
    !escrow.proofURI &&
    ["pending", "funded"].includes(escrow.status);

  const canConfirmReceipt =
    isBuyer &&
    // !!escrow.proofURI &&
    !escrow.receiptConfirmed &&
    ["pending", "funded"].includes(escrow.status);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleUploadProof = (proofURI: string, description?: string) => {
    uploadProof({
      escrowId: escrow.escrowId,
      data: { proofURI, description },
    });
    setShowUploadProof(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-3 h-3 rounded-full", statusColor)} />
              <span className="text-sm text-muted-foreground">
                Escrow #{escrow.escrowId}
              </span>
            </div>
            <h3 className="text-lg font-semibold">
              {escrow.buyer.displayName} → {escrow.seller.displayName}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(String(escrow.escrowId))}
            >
              <Copy className="h-4 w-4" />
            </Button>

            {escrow.transactionHash && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  window.open(
                    `https://etherscan.io/tx/${escrow.transactionHash}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {weiToEth(escrow.amount)} {getTokenSymbol(escrow.token)}
            </span>
            <StatusIcon
              className={cn("h-5 w-5", statusColor.replace("bg-", "text-"))}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            ≈ ${usdAmount} USD
          </span>
        </div>

        {/* Proof */}
        {proof?.proofURI && (
          <div className="mb-4 p-3 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Truck className="h-4 w-4" />
              <span className="text-sm font-medium">Proof submitted</span>
            </div>
            <div className="text-xs mt-1 text-green-600 dark:text-green-400">
              Submitted by {proof.submittedBy.displayName}
            </div>
          </div>
        )}

        {/* Parties */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <div className="text-muted-foreground">Buyer</div>
            <div className="font-medium">{escrow.buyer.displayName}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Seller</div>
            <div className="font-medium">{escrow.seller.displayName}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Arbiter</div>
            <div className="font-medium">{escrow.arbiter.displayName}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {canSubmitProof && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSubmitProof}
              className="group"
              title="Submit proof of service"
              isLoading={isUploadingProof}
            >
              <Upload className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>
          )}

          {canConfirmReceipt && (
            <Button
              size="sm"
              onClick={() => confirmReceipt(escrow.escrowId)}
              isLoading={isPending}
            >
              <PackageCheck className="h-4 w-4 mr-2" />
              Confirm Receipt
            </Button>
          )}

          {canRelease && (
            <Button
              size="sm"
              onClick={() => releaseFunds(escrow.escrowId)}
              isLoading={isReleasing}
            >
              Release Funds to Seller
            </Button>
          )}

          {canRefund && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => refundBuyer(escrow.escrowId)}
              isLoading={isRefunding}
            >
              Refund Buyer
            </Button>
          )}

          {canDispute && !showDisputeInput && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDisputeInput(true)}
            >
              Raise Dispute
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDetails(true)}
          >
            View Details
          </Button>
        </div>

        {/* Dispute input */}
        {showDisputeInput && (
          <div className="mt-4 p-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <label className="block text-sm font-medium mb-1 text-red-700 dark:text-red-300">
              Dispute reason
            </label>

            <textarea
              rows={3}
              className="w-full rounded-md border p-2 text-sm bg-background"
              placeholder="Explain the issue clearly..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="destructive"
                disabled={!disputeReason.trim()}
                isLoading={isDisputing}
                onClick={() => {
                  raiseDispute({
                    escrowId: escrow.escrowId,
                    reason: disputeReason.trim(),
                  });
                  setShowDisputeInput(false);
                  setDisputeReason("");
                }}
              >
                Submit Dispute
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowDisputeInput(false);
                  setDisputeReason("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      <UploadProofModal
        isOpen={showUploadProof}
        onClose={() => setShowUploadProof(false)}
        onUpload={handleUploadProof}
        isLoading={isUploadingProof}
      />

      <DetailCard
        escrow={escrow}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};
