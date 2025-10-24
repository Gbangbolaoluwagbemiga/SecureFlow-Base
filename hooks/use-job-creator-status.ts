import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/web3-context";
import { CONTRACTS } from "@/lib/web3/config";
import { SECUREFLOW_ABI } from "@/lib/web3/abis";

export function useJobCreatorStatus() {
  const { wallet, getContract } = useWeb3();
  const [isJobCreator, setIsJobCreator] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet.isConnected || !wallet.address) {
      setIsJobCreator(false);
      return;
    }

    checkJobCreatorStatus();
  }, [wallet.isConnected, wallet.address]);

  const checkJobCreatorStatus = async () => {
    setLoading(true);
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);
      if (!contract) {
        setIsJobCreator(false);
        return;
      }

      // Get total number of escrows
      const totalEscrows = await contract.call("nextEscrowId");
      const escrowCount = Number(totalEscrows);

      // Check if current wallet has created any escrows
      if (escrowCount > 1) {
        for (let i = 1; i < escrowCount; i++) {
          try {
            const escrowSummary = await contract.call("getEscrowSummary", i);
            
            // Check if current user is the depositor (job creator)
            const isMyJob = escrowSummary[0].toLowerCase() === wallet.address?.toLowerCase();
            
            if (isMyJob) {
              setIsJobCreator(true);
              setLoading(false);
              return;
            }
          } catch (error) {
            // Skip escrows that don't exist
            continue;
          }
        }
      }
      
      setIsJobCreator(false);
    } catch (error) {
      setIsJobCreator(false);
    } finally {
      setLoading(false);
    }
  };

  return { isJobCreator, loading };
}
