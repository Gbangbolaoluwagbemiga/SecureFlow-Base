"use client";

import { useEffect } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useWeb3 } from "@/contexts/web3-context";

export function useAppKitSync() {
  const { open, address, isConnected } = useAppKit();

  // This hook doesn't return anything, it just syncs AppKit with the app
  // The Web3 context will pick up the connection via window.ethereum

  useEffect(() => {
    if (isConnected && address) {
      // Trigger a connection check in Web3 context
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.request({ method: "eth_requestAccounts" }).catch(() => {
          // Ignore errors
        });
      }
    }
  }, [isConnected, address]);

  return { open, address, isConnected };
}



