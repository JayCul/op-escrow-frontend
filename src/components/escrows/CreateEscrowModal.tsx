import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEscrows } from "@/hooks/useEscrows";
import type { User as UserType } from "@/types";
import { usersService } from "@/services/escrows.service";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { useDebounce } from "@/hooks/useDebounce";
import { useUser } from "@/stores/auth.store";
import { parseUnits } from "ethers";

type Step = "details" | "review";

interface CreateEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<Step>("details");
  const user = useUser();

  const [formData, setFormData] = useState({
    amount: "",
    token: "0x0000000000000000000000000000000000000000", // Default to ETH
    description: "",
    sellerId: "" as string | null,
    buyerId: user!._id as string | null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [selectedSeller, setSelectedSeller] = useState<UserType | null>(null);

  const { createEscrow, isCreating } = useEscrows();
  const TOKENS = {
    ETH: "0x0000000000000000000000000000000000000000",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  };

  const TOKEN_BY_ADDRESS = Object.entries(TOKENS).reduce(
    (acc, [symbol, address]) => {
      acc[address.toLowerCase()] = symbol;
      return acc;
    },
    {} as Record<string, string>
  );

  const getTokenLabel = (tokenAddress?: string) => {
    if (!tokenAddress) return "Unknown";
    return TOKEN_BY_ADDRESS[tokenAddress.toLowerCase()] ?? "Unknown";
  };

  const { data: searchResults } = useQuery({
    queryKey: ["users-search", debouncedSearchTerm],
    queryFn: () =>
      usersService.searchUsers({ searchTerm: debouncedSearchTerm }),
    enabled: debouncedSearchTerm.length > 2,
    staleTime: 60000,
    placeholderData: (previousData) => previousData,
  });

  const TOKEN_DECIMALS: Record<string, number> = {
    [TOKENS.ETH]: 18,
    [TOKENS.DAI]: 18,
    [TOKENS.USDC]: 6,
  };

  const submitEscrow = async () => {
    const decimals = TOKEN_DECIMALS[formData.token];
    const amountWei = parseUnits(formData.amount, decimals).toString();

    if (!formData.amount || !formData.sellerId) {
      toast.error("Amount and seller are required");
      return;
    }

    try {
      await createEscrow({
        buyerId: formData.buyerId,
        sellerId: formData.sellerId,
        amount: amountWei,
        token: formData.token,
        // description: formData.description || undefined,
      });
      onClose();
      setStep("details");
      setFormData({
        amount: "",
        token: "0x0000000000000000000000000000000000000000",
        description: "",
        sellerId: null,
        buyerId: user!._id,
      });
      setSelectedSeller(null);
    } catch (error: any) {
      toast.error("Failed to create escrow", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Escrow" size="lg">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {["details", "review"].map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex items-center gap-2 text-sm font-medium",
              step === s ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center border",
                step === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {step === "review" && i === 0 ? <Check size={14} /> : i + 1}
            </span>
            {s === "details" ? "Details" : "Review"}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {step === "details" && (
            <div className="space-y-6">
              {/* Amount */}
              <div>
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                  <select
                    className="px-3 py-2 border rounded-md bg-background"
                    value={formData.token}
                    onChange={(e) =>
                      setFormData({ ...formData, token: e.target.value })
                    }
                  >
                    {Object.entries(TOKENS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description (optional)
                </label>
                <Input
                  placeholder="What is this escrow for?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Seller */}
              <div>
                <label className="text-sm font-medium mb-2 block">Seller</label>

                {selectedSeller ? (
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {selectedSeller.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedSeller.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSeller(null);
                        setFormData({ ...formData, sellerId: null });
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder="Search by name or email…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                      {searchResults?.data.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            setSelectedSeller(user);
                            setFormData({
                              ...formData,
                              sellerId: user.id,
                            });
                            setSearchTerm("");
                          }}
                          className="p-2 rounded-md hover:bg-accent cursor-pointer"
                        >
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground">Amount</div>
                  <div className="font-medium">
                    {formData.amount} {getTokenLabel(formData.token)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Seller</div>
                  <div className="font-medium">
                    {selectedSeller?.displayName}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-muted-foreground">Buyer</div>
                <div className="font-medium">{user?.displayName}</div>
              </div>
              {formData.description && (
                <div>
                  <div className="text-muted-foreground mb-1">Description</div>
                  <div>{formData.description}</div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => (step === "details" ? onClose() : setStep("details"))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={() =>
            step === "review" ? submitEscrow() : setStep("review")
          }
          isLoading={isCreating}
          disabled={!formData.amount || !formData.sellerId}
        >
          {step === "review" ? "Create Escrow" : "Continue"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Modal>
  );
};
