import React from "react";
import { EscrowCard } from "@/components/escrows/EscrowCard";
import { useEscrows } from "@/hooks/useEscrows";
import type { Escrow } from "@/types";
import { useUser } from "@/stores/auth.store";

export const Escalations: React.FC = () => {
  const { escrows, isLoading } = useEscrows({ status: "disputed" });
  const user = useUser();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Disputed Escrows</h1>
      {isLoading ? (
        <div className="text-gray-500">Loading disputed escrows...</div>
      ) : escrows?.length === 0 ? (
        <div className="text-gray-400">No disputed escrows at the moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escrows.map((escrow: Escrow) => (
            <EscrowCard
              key={escrow.escrowId}
              escrow={escrow}
              currentUserId={user._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
