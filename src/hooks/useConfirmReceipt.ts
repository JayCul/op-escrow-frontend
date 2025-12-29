import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ethers } from "ethers";
import escrowArtifact from "@/contracts/EscrowABI.json";
import { ESCROW_CONTRACT_ADDRESS } from "@/config";
import { escrowsService } from "@/services/escrows.service";

export const useConfirmReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (escrowId: number) => {
      if (!window.ethereum) {
        throw new Error("Please connect your wallet");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        escrowArtifact.abi,
        signer
      );

      let receipt;

      try {
        const tx = await contract.confirmReceipt(escrowId);
        receipt = await tx.wait();
      } catch (err: any) {
        const reason =
          err?.reason || err?.shortMessage || err?.info?.error?.message;

        if (reason?.includes("Not buyer")) {
          throw new Error("Only the buyer can confirm receipt");
        }

        throw err;
      }

      // 🔑 Sync backend AFTER chain success
      await escrowsService.confirmReceipt(escrowId, receipt.transactionHash);

      return receipt;
    },

    onSuccess: () => {
      toast.success("Receipt confirmed successfully");

      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },

    onError: (error: any) => {
      toast.error(error.message || "Transaction failed");
    },
  });
};
