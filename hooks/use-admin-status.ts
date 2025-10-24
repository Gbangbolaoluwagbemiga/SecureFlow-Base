import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/web3-context";
import { useDelegation } from "@/contexts/delegation-context";
import { CONTRACTS } from "@/lib/web3/config";
import { SECUREFLOW_ABI } from "@/lib/web3/abis";

export function useAdminStatus() {
  const { wallet, getContract } = useWeb3();
  const { getActiveDelegations, delegations } = useDelegation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet.isConnected || !wallet.address) {
      setIsAdmin(false);
      return;
    }

    checkAdminStatus();
  }, [wallet.isConnected, wallet.address, delegations.length]);

  const checkAdminStatus = async () => {
    setLoading(true);
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);
      if (!contract) {
        setIsAdmin(false);
        return;
      }

      // Get the contract owner
      const owner = await contract.call("owner");

      // Check if current wallet is the owner
      const isOwner =
        owner.toString().toLowerCase() === wallet.address?.toLowerCase();

      // Also check if user has an active delegation granted TO their address
      const activeDelegations = getActiveDelegations();
      const hasDelegationForUser = activeDelegations.some(
        (d) => d.delegatee.toLowerCase() === wallet.address?.toLowerCase(),
      );

      setIsAdmin(isOwner || hasDelegationForUser);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
}
