"use client";

import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/web3-context";
import { useAppKit } from "@reown/appkit/react";

export function WalletButton() {
  const { wallet } = useWeb3();
  const { open } = useAppKit();

  const handleClick = async () => {
    await open?.();
  };

  if (!wallet.isConnected || !wallet.address) {
    return (
      <Button onClick={handleClick} variant="default">
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} variant="secondary" className="font-mono">
      {Number(wallet.balance).toFixed(3)} ETH · {wallet.address.slice(0, 6)}…
      {wallet.address.slice(-4)}
    </Button>
  );
}
