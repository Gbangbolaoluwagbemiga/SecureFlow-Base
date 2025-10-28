"use client";

import React, { useEffect } from "react";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { ethers } from "ethers";

// Get projectId from environment
const projectId =
  process.env.NEXT_PUBLIC_REOWN_ID || "1db88bda17adf26df9ab7799871788c4";

// Create metadata
const metadata = {
  name: "SecureFlow",
  description: "Secure Escrow Platform for Freelancers",
  url: "https://secureflow.app",
  icons: ["/secureflow-logo.svg"],
};

// Define networks with EIP-3085 compatible metadata
const networks = [
  {
    id: 84532,
    name: "Base Sepolia Testnet",
    currency: "ETH",
    explorerUrl: "https://sepolia.basescan.org",
    rpcUrl: "https://sepolia.base.org",
  },
  {
    id: 8453,
    name: "Base",
    currency: "ETH",
    explorerUrl: "https://basescan.org",
    rpcUrl: "https://mainnet.base.org",
  },
] as const;

// Chain metadata for wallet_addEthereumChain
const chainMetadata: Record<number, any> = {
  84532: {
    chainId: "0x14a34",
    chainName: "Base Sepolia Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
  8453: {
    chainId: "0x2105",
    chainName: "Base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
};

// Helper to add chain to MetaMask
async function addChainToWallet(chainId: number) {
  if (typeof window === "undefined" || !window.ethereum) {
    return;
  }

  const metadata = chainMetadata[chainId];
  if (!metadata) {
    return;
  }

  try {
    // First try to switch to the chain
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: metadata.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [metadata],
        });
      } catch (addError) {
        console.error("Failed to add chain:", addError);
        throw addError;
      }
    } else {
      console.error("Failed to switch chain:", switchError);
      throw switchError;
    }
  }
}

// Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: networks as any,
  projectId,
  features: {
    analytics: true,
    email: false, // Disable email login if not needed
    socials: [], // No social logins
    onramp: false, // Disable on-ramp
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(var(--primary))',
  },
  // Enable all wallet connectors
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
});

export function AppKit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      return;
    }

    // Listen for chain changes and ensure the chain is added to MetaMask
    const handleChainChanged = async (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      
      // If it's one of our supported chains, ensure it's added to the wallet
      if (chainMetadata[chainId]) {
        try {
          await addChainToWallet(chainId);
        } catch (error) {
          console.error("Failed to add chain after detection:", error);
        }
      }
    };

    // Listen for account connections
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        // When an account connects, check and add the default chain
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
        const chainId = parseInt(chainIdHex as string, 16);
        
        if (chainMetadata[chainId]) {
          try {
            await addChainToWallet(chainId);
          } catch (error) {
            // Silently fail - user may have rejected
            console.log("Chain add skipped or rejected by user");
          }
        }
      }
    };

    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // Check current chain on mount
    window.ethereum.request({ method: "eth_chainId" }).then(async (chainIdHex: any) => {
      const chainId = parseInt(chainIdHex, 16);
      if (chainMetadata[chainId]) {
        try {
          await addChainToWallet(chainId);
        } catch (error) {
          // Silently fail on mount
          console.log("Initial chain check - chain may already be added");
        }
      }
    }).catch(() => {
      // Ignore errors on mount
    });

    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return <>{children}</>;
}

// Export helper for manual chain adding
export { addChainToWallet };
