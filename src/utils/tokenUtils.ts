import { useEthPrice } from "@/hooks/useETHPrice";
import { formatEther } from "ethers";
import { useMemo } from "react";
interface WeiToUsdResult {
  usdAmount: string | null;
  ethAmount: string;
  loading: boolean;
  error: string | null;
}

export const useWeiToUsd = (
  weiAmount: string | bigint | null | undefined,
  decimals: number = 2
): WeiToUsdResult => {
  const {
    price: ethPrice,
    loading: priceLoading,
    error: priceError,
  } = useEthPrice();

  const ethAmount = useMemo(() => {
    if (weiAmount === null || weiAmount === undefined || weiAmount === "") {
      return "0";
    }

    try {
      const ethValue = formatEther(weiAmount);
      return parseFloat(ethValue).toString();
    } catch (error) {
      console.error("Error converting wei to ETH:", error);
      return "0";
    }
  }, [weiAmount]);

  const usdAmount = useMemo(() => {
    if (!ethPrice || !ethAmount || parseFloat(ethAmount) === 0) {
      return null;
    }

    try {
      const usdValue = parseFloat(ethAmount) * ethPrice;
      return usdValue.toFixed(decimals);
    } catch (error) {
      console.error("Error converting ETH to USD:", error);
      return null;
    }
  }, [ethAmount, ethPrice, decimals]);

  return {
    usdAmount,
    ethAmount,
    loading: priceLoading,
    error: priceError,
  };
};

export const weiToEth = (
  weiAmount: string | bigint | null | undefined,
  decimals: number = 4
): string => {
  if (weiAmount === null || weiAmount === undefined || weiAmount === "") {
    return "0";
  }

  try {
    const ethValue = formatEther(weiAmount);
    const numberValue = parseFloat(ethValue);
    return numberValue.toFixed(decimals);
  } catch (error) {
    console.error("Error converting wei to ETH:", error);
    return "0";
  }
};

export const getTokenSymbol = (
  tokenAddress: string | null | undefined
): string => {
  if (!tokenAddress) {
    return "ETH";
  }

  const zeroAddress = "0x0000000000000000000000000000000000000000";
  if (tokenAddress.toLowerCase() === zeroAddress.toLowerCase()) {
    return "ETH";
  }

  const tokenMap: { [key: string]: string } = {
    "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
    "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
  };

  return tokenMap[tokenAddress.toLowerCase()] || "TOKEN";
};

export const formatEscrowDisplay = (
  weiAmount: string | bigint | null | undefined,
  tokenAddress: string | null | undefined,
  decimals: number = 4
): string => {
  const amount = weiToEth(weiAmount, decimals);
  const symbol = getTokenSymbol(tokenAddress);
  return `${amount} ${symbol}`;
};
