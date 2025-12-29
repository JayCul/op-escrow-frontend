import React, { useState, useCallback } from "react";
import { BrowserProvider, JsonRpcSigner, type Eip1193Provider } from "ethers";
import { toast } from "sonner";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

interface WalletState {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: string | null;
  isConnecting: boolean;
}

export const useMetaMask = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnecting: false,
  });

  const checkMetaMaskInstalled = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return typeof window.ethereum !== "undefined";
  }, []);

  const connectWallet = useCallback(async (): Promise<{
    success: boolean;
    account?: string;
    error?: string;
  }> => {
    if (!checkMetaMaskInstalled()) {
      toast.error("Please install MetaMask to connect your wallet");
      return { success: false, error: "MetaMask not installed" };
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true }));

    try {
      const provider = new BrowserProvider(window.ethereum!);

      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }
      console.log("MetaMask accounts:", accounts);

      const account = accounts[0];
      const signer = await provider.getSigner();
      console.log("MetaMask account obtained:", account);

      // Get chain ID
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      setWalletState({
        account,
        provider,
        signer,
        chainId,
        isConnecting: false,
      });

      toast.success("Wallet connected successfully!");
      return { success: true, account };
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);

      let errorMessage = "Failed to connect wallet";

      if (error.code === 4001) {
        errorMessage = "Please connect your wallet to continue";
      } else if (error.code === -32002) {
        errorMessage =
          "Wallet connection already pending. Please check MetaMask";
      } else if (error.message.includes("No accounts found")) {
        errorMessage = "No accounts found in MetaMask";
      }

      toast.error(errorMessage);
      setWalletState((prev) => ({ ...prev, isConnecting: false }));
      return { success: false, error: errorMessage };
    }
  }, [checkMetaMaskInstalled]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      account: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnecting: false,
    });
    toast.info("Wallet disconnected");
  }, []);

  const switchNetwork = useCallback(
    async (chainId: string): Promise<boolean> => {
      if (!walletState.provider || !checkMetaMaskInstalled()) {
        return false;
      }

      try {
        await window.ethereum!.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
        return true;
      } catch (error: any) {
        console.error("Failed to switch network:", error);

        if (error.code === 4902) {
          // Chain not added, you could add it here
          toast.error("Network not found in MetaMask");
        } else {
          toast.error("Failed to switch network");
        }
        return false;
      }
    },
    [walletState.provider, checkMetaMaskInstalled]
  );

  const signMessage = async (message: string) => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask not available in signMessage");
        return null;
      }

      // Get current accounts - use eth_requestAccounts to ensure permission
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Accounts available for signing:", accounts);

      if (accounts.length === 0) {
        console.error("No accounts available after eth_requestAccounts");
        return null;
      }

      console.log("Attempting to sign with account:", accounts[0]);
      console.log("Message to sign:", message);

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, accounts[0]],
      });

      console.log("Successfully obtained signature:", signature);
      return signature;
    } catch (error: any) {
      console.error("Detailed sign message error:", error);

      // Specific error handling
      if (error.code === 4001) {
        console.error("User rejected the signing request");
        toast.error("Signature request was cancelled.");
      } else if (error.code === -32602) {
        console.error("Invalid parameters for personal_sign");
      } else if (error.code === -32603) {
        console.error("Internal JSON-RPC error");
      }

      return null;
    }
  };

  // Listen for account changes
  const setupEventListeners = useCallback(() => {
    if (!window.ethereum) return;

    const eth: any = window.ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected all accounts
        disconnectWallet();
        toast.info("Wallet disconnected");
      } else if (accounts[0] !== walletState.account) {
        // Account changed
        setWalletState((prev) => ({ ...prev, account: accounts[0] }));
        toast.info("Account changed");
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWalletState((prev) => ({ ...prev, chainId }));
      window.location.reload(); // Recommended by MetaMask docs
    };

    if (typeof eth.on === "function") {
      eth.on("accountsChanged", handleAccountsChanged);
      eth.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (typeof eth.removeListener === "function") {
        eth.removeListener("accountsChanged", handleAccountsChanged);
        eth.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [walletState.account, disconnectWallet]);

  // Initialize event listeners on mount
  React.useEffect(() => {
    const cleanup = setupEventListeners();
    return cleanup;
  }, [setupEventListeners]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signMessage,
    isMetaMaskInstalled: checkMetaMaskInstalled(),
  };
};
