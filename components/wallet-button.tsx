"use client";

import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/web3-context";
import { Wallet, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BASE_TESTNET } from "@/lib/web3/config";

export function WalletButton() {
  const { wallet, connectWallet, disconnectWallet, switchToBaseTestnet } =
    useWeb3();

  if (!wallet.isConnected) {
    return (
      <Button onClick={connectWallet} className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  const targetChainId = Number.parseInt(BASE_TESTNET.chainId, 16);
  const isOnBase = wallet.chainId === targetChainId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Wallet className="h-4 w-4" />
          {!isOnBase && <AlertCircle className="h-4 w-4 text-destructive" />}
          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm">
          <div className="text-muted-foreground">Balance</div>
          <div className="font-mono font-semibold">{wallet.balance} ETH</div>
        </div>
        {!isOnBase && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-sm">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">Wrong Network</span>
              </div>
              <Button
                onClick={switchToBaseTestnet}
                size="sm"
                variant="default"
                className="w-full"
              >
                Switch to Base Sepolia
              </Button>
            </div>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
