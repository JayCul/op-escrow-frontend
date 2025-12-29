// hooks/useEthPrice.ts
import { useState, useEffect } from "react";

interface EthPriceData {
  price: number | null;
  loading: boolean;
  error: string | null;
}

export const useEthPrice = (): EthPriceData => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        setLoading(true);
        setError(null);

        // Using CoinGecko API (free)
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch ETH price");
        }

        const data = await response.json();
        setPrice(data.ethereum.usd);
      } catch (err) {
        console.error("Error fetching ETH price:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch ETH price"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEthPrice();

    // Optional: Refresh price every 60 seconds
    const interval = setInterval(fetchEthPrice, 360000);

    return () => clearInterval(interval);
  }, []);

  return { price, loading, error };
};
