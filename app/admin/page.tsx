"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useWeb3 } from "@/contexts/web3-context";
import { useAdminStatus } from "@/hooks/use-admin-status";
import { useToast } from "@/hooks/use-toast";
import { CONTRACTS } from "@/lib/web3/config";
import { SECUREFLOW_ABI } from "@/lib/web3/abis";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminStats } from "@/components/admin/admin-stats";
import { ContractControls } from "@/components/admin/contract-controls";
import { AdminLoading } from "@/components/admin/admin-loading";
import { DisputeResolution } from "@/components/admin/dispute-resolution";
import {
  Lock,
  Shield,
  Play,
  Pause,
  Download,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminPage() {
  const { wallet, getContract } = useWeb3();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const { toast } = useToast();
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contractOwner, setContractOwner] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "pause" | "unpause" | "withdraw" | null
  >(null);
  const [withdrawData, setWithdrawData] = useState({
    token: CONTRACTS.MOCK_ERC20,
    amount: "",
  });
  const [testMode, setTestMode] = useState(false);
  const [contractStats, setContractStats] = useState({
    platformFeeBP: 0,
    totalEscrows: 0,
    totalVolume: "0",
    authorizedArbiters: 0,
    whitelistedTokens: 0,
  });

  useEffect(() => {
    if (wallet.isConnected) {
      checkPausedStatus();
      fetchContractOwner();
      fetchContractStats();
    }
  }, [wallet.isConnected]);

  const fetchContractOwner = async () => {
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);
      const owner = await contract.owner();
      setContractOwner(owner);
    } catch (error) {}
  };

  const fetchContractStats = async () => {
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);

      // Fetch platform fee
      const platformFeeBP = await contract.call("platformFeeBP");

      // Fetch total escrows count
      const totalEscrows = await contract.call("nextEscrowId");

      // Set actual contract stats
      setContractStats({
        platformFeeBP: Number(platformFeeBP),
        totalEscrows: Number(totalEscrows),
        totalVolume: "0", // Would need to be tracked in contract
        authorizedArbiters: 2, // We authorized 2 arbiters during deployment
        whitelistedTokens: 1, // We whitelisted 1 token (MockERC20)
      });
    } catch (error) {
      // Set empty stats if contract calls fail
      setContractStats({
        platformFeeBP: 0,
        totalEscrows: 0,
        totalVolume: "0",
        authorizedArbiters: 0,
        whitelistedTokens: 0,
      });
    }
  };

  const checkPausedStatus = async () => {
    setLoading(true);
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);
      const paused = await contract.call("paused");

      // Handle different possible return types - including Proxy objects
      let isPaused = false;

      if (paused === true || paused === "true" || paused === 1) {
        isPaused = true;
      } else if (paused === false || paused === "false" || paused === 0) {
        isPaused = false;
      } else if (paused && typeof paused === "object") {
        // Handle Proxy objects - try to extract the actual value
        try {
          const pausedValue = paused.toString();
          isPaused = pausedValue === "true" || pausedValue === "1";
        } catch (e) {
          isPaused = false; // Default to not paused
        }
      }

      setIsPaused(isPaused);
    } catch (error) {
      // Fallback to false if contract call fails
      setIsPaused(false);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type: typeof actionType) => {
    setActionType(type);
    setDialogOpen(true);
  };

  const handleAction = async () => {
    try {
      // If in test mode, simulate the action without calling the contract
      if (testMode) {
        switch (actionType) {
          case "pause":
            setIsPaused(true);
            toast({
              title: "🧪 Test Mode: Contract paused",
              description: "Simulated: All escrow operations are now paused",
            });
            break;
          case "unpause":
            setIsPaused(false);
            toast({
              title: "🧪 Test Mode: Contract unpaused",
              description: "Simulated: Escrow operations have been resumed",
            });
            break;
          case "withdraw":
            toast({
              title: "🧪 Test Mode: Tokens withdrawn",
              description: `Simulated: Withdrew ${withdrawData.amount} tokens from ${withdrawData.token}`,
            });
            break;
        }
        setDialogOpen(false);
        return;
      }

      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);

      switch (actionType) {
        case "pause":
          // Check if contract is already paused
          const currentPausedStatusForPause = await contract.call("paused");

          // Handle different possible return types - including Proxy objects
          let isPausedForPause = false;

          if (
            currentPausedStatusForPause === true ||
            currentPausedStatusForPause === "true" ||
            currentPausedStatusForPause === 1
          ) {
            isPausedForPause = true;
          } else if (
            currentPausedStatusForPause === false ||
            currentPausedStatusForPause === "false" ||
            currentPausedStatusForPause === 0
          ) {
            isPausedForPause = false;
          } else if (
            currentPausedStatusForPause &&
            typeof currentPausedStatusForPause === "object"
          ) {
            try {
              const pausedValue = currentPausedStatusForPause.toString();
              isPausedForPause = pausedValue === "true" || pausedValue === "1";
            } catch (e) {
              isPausedForPause = false;
            }
          }

          if (isPausedForPause) {
            toast({
              title: "Contract Already Paused",
              description: "The contract is already in a paused state",
              variant: "default",
            });
            return;
          }

          await contract.send("pause", "no-value");
          setIsPaused(true);
          toast({
            title: "Contract paused",
            description: "All escrow operations are now paused",
          });
          break;
        case "unpause":
          // Check if contract is already unpaused
          const currentPausedStatus = await contract.call("paused");

          // Handle different possible return types - including Proxy objects
          let isPaused = false;

          if (
            currentPausedStatus === true ||
            currentPausedStatus === "true" ||
            currentPausedStatus === 1
          ) {
            isPaused = true;
          } else if (
            currentPausedStatus === false ||
            currentPausedStatus === "false" ||
            currentPausedStatus === 0
          ) {
            isPaused = false;
          } else if (
            currentPausedStatus &&
            typeof currentPausedStatus === "object"
          ) {
            try {
              const pausedValue = currentPausedStatus.toString();
              isPaused = pausedValue === "true" || pausedValue === "1";
            } catch (e) {
              isPaused = false;
            }
          }

          if (!isPaused) {
            toast({
              title: "Contract Already Unpaused",
              description: "The contract is already in an active state",
              variant: "default",
            });
            return;
          }

          await contract.send("unpause", "no-value");
          setIsPaused(false);
          toast({
            title: "Contract unpaused",
            description: "Escrow operations have been resumed",
          });
          break;
        case "withdraw":
          await contract.send(
            "withdrawStuckTokens",
            "no-value",
            withdrawData.token,
            withdrawData.amount
          );
          toast({
            title: "Tokens withdrawn",
            description: `Successfully withdrew ${withdrawData.amount} tokens`,
          });
          setWithdrawData({ token: CONTRACTS.MOCK_ERC20, amount: "" });
          break;
      }

      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message || "Failed to perform admin action",
        variant: "destructive",
      });
    }
  };

  const getDialogContent = () => {
    const testModePrefix = testMode ? "🧪 Test Mode: " : "";
    const testModeSuffix = testMode ? " (Simulated)" : "";

    switch (actionType) {
      case "pause":
        return {
          title: `${testModePrefix}Pause Contract${testModeSuffix}`,
          description: testMode
            ? "This will simulate pausing all escrow operations. No real transaction will be sent."
            : "This will pause all escrow operations. Users will not be able to create new escrows or interact with existing ones until the contract is unpaused.",
          icon: Pause,
          confirmText: testMode ? "Simulate Pause" : "Pause Contract",
          variant: "destructive" as const,
        };
      case "unpause":
        return {
          title: `${testModePrefix}Unpause Contract${testModeSuffix}`,
          description: testMode
            ? "This will simulate resuming all escrow operations. No real transaction will be sent."
            : "This will resume all escrow operations. Users will be able to interact with escrows again.",
          icon: Play,
          confirmText: testMode ? "Simulate Unpause" : "Unpause Contract",
          variant: "default" as const,
        };
      case "withdraw":
        return {
          title: `${testModePrefix}Withdraw Stuck Tokens${testModeSuffix}`,
          description: testMode
            ? "This will simulate withdrawing tokens. No real transaction will be sent."
            : "Withdraw tokens that may be stuck in the contract. This should only be used in emergency situations.",
          icon: Download,
          confirmText: testMode ? "Simulate Withdraw" : "Withdraw Tokens",
          variant: "destructive" as const,
        };
      default:
        return {
          title: "",
          description: "",
          icon: Shield,
          confirmText: "Confirm",
          variant: "default" as const,
        };
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <Card className="glass border-primary/20 p-12 text-center max-w-md">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to access admin controls
          </p>
        </Card>
      </div>
    );
  }

  // Show loading state while checking admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <Card className="glass border-primary/20 p-12 text-center max-w-md">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <h2 className="text-2xl font-bold mb-2">Checking Access...</h2>
          <p className="text-muted-foreground">Verifying admin permissions</p>
        </Card>
      </div>
    );
  }

  // Only show access denied after loading is complete
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <Card className="glass border-destructive/20 p-12 text-center max-w-md">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access this page. Only the contract
            owner can access admin controls.
          </p>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left space-y-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Your wallet:</span>
              <br />
              <span className="font-mono">{wallet.address}</span>
            </p>
            {contractOwner && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Contract owner:</span>
                <br />
                <span className="font-mono">{contractOwner}</span>
              </p>
            )}
            <p className="text-xs text-amber-600 mt-4">
              💡 <span className="font-semibold">Tip:</span> Make sure you're
              connected with the wallet that deployed the SecureFlow contract.
              {/* Update the owner address in{" "} */}
              {/* <code className="bg-muted px-1 rounded">
                contexts/web3-context.tsx
              </code> */}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const dialogContent = getDialogContent();
  const Icon = dialogContent.icon;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Admin Controls</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Manage the SecureFlow escrow contract
          </p>

          {/* Test Mode Toggle */}
          <Card className="glass border-accent/20 p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  🧪 Admin Testing Mode
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enable test mode to simulate admin functions and test the
                  interface without executing real transactions.
                </p>
              </div>
              <Button
                variant={testMode ? "default" : "outline"}
                onClick={() => setTestMode(!testMode)}
                className="ml-4"
              >
                {testMode ? "Exit Test Mode" : "Enable Test Mode"}
              </Button>
            </div>
            {testMode && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Mode Active:</strong> All admin functions will be
                  simulated. No real transactions will be sent to the
                  blockchain. This allows you to test the admin interface and
                  see how it would work for a judge or other admin user.
                </AlertDescription>
              </Alert>
            )}
          </Card>

          {/* Judge Testing Instructions */}
          <Card className="glass border-primary/20 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">
                  🏆 For Hackathon Judges
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    To test admin functionalities as a judge, you have several
                    options:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-primary font-bold">1.</span>
                      <div>
                        <strong>Test Mode (Recommended):</strong> Use the
                        "Enable Test Mode" button above to simulate admin
                        functions without real transactions.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary font-bold">2.</span>
                      <div>
                        <strong>Use Different Wallet:</strong> Connect with a
                        different wallet address to test non-admin user
                        experience.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Test Mode provides a safe way to
                      test all admin functionalities without affecting the live
                      contract or requiring additional permissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {isPaused && (
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Contract Paused</AlertTitle>
              <AlertDescription>
                All escrow operations are currently paused. Users cannot create
                or interact with escrows.
              </AlertDescription>
            </Alert>
          )}

          <Card className="glass border-primary/20 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">Contract Status</h2>
                  {testMode && (
                    <Badge variant="secondary" className="gap-1">
                      🧪 Test Mode
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Current State:</span>
                  {isPaused ? (
                    <Badge variant="destructive" className="gap-2">
                      <Pause className="h-3 w-3" />
                      Paused
                    </Badge>
                  ) : (
                    <Badge variant="default" className="gap-2">
                      <Play className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">
                  Contract Address
                </p>
                <p className="font-mono text-sm">
                  {CONTRACTS.SECUREFLOW_ESCROW.slice(0, 20)}...
                </p>
              </div>
            </div>
          </Card>

          <DisputeResolution onDisputeResolved={fetchContractStats} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="glass border-primary/20 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {isPaused ? (
                    <Play className="h-6 w-6 text-primary" />
                  ) : (
                    <Pause className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {isPaused ? "Unpause Contract" : "Pause Contract"}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isPaused
                      ? "Resume all escrow operations and allow users to interact with the contract"
                      : "Temporarily halt all escrow operations for maintenance or emergency situations"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => openDialog(isPaused ? "unpause" : "pause")}
                variant={isPaused ? "default" : "destructive"}
                className="w-full gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Unpause Contract
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Contract
                  </>
                )}
              </Button>
            </Card>

            <Card className="glass border-primary/20 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                  <Download className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    Withdraw Stuck Tokens
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Emergency function to withdraw tokens that may be stuck in
                    the contract
                  </p>
                </div>
              </div>
              <Button
                onClick={() => openDialog("withdraw")}
                variant="destructive"
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Withdraw Tokens
              </Button>
            </Card>
          </div>

          <Card className="glass border-primary/20 p-6">
            <h2 className="text-2xl font-bold mb-6">Contract Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Owner Address
                </Label>
                <p className="font-mono text-sm bg-muted/50 p-3 rounded-lg">
                  {contractOwner || wallet.address}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Connected Wallet
                </Label>
                <p className="font-mono text-sm bg-muted/50 p-3 rounded-lg">
                  {wallet.address}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Contract Address
                </Label>
                <p className="font-mono text-sm bg-muted/50 p-3 rounded-lg">
                  {CONTRACTS.SECUREFLOW_ESCROW}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Network
                </Label>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  Base Sepolia Testnet
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Chain ID
                </Label>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">84532</p>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Platform Fee
                </Label>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {contractStats.platformFeeBP}% (
                  {(contractStats.platformFeeBP / 100).toFixed(2)}%)
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Total Escrows
                </Label>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {contractStats.totalEscrows}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Authorized Arbiters
                </Label>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {contractStats.authorizedArbiters}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Whitelisted Tokens
                </Label>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {contractStats.whitelistedTokens}
                </p>
              </div>
            </div>
          </Card>

          <Alert className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Admin Privileges</AlertTitle>
            <AlertDescription>
              These controls have significant impact on the contract and all
              users. Use them responsibly and only when necessary. All actions
              are recorded on the blockchain.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  dialogContent.variant === "destructive"
                    ? "bg-destructive/10"
                    : "bg-primary/10"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    dialogContent.variant === "destructive"
                      ? "text-destructive"
                      : "text-primary"
                  }`}
                />
              </div>
              <DialogTitle className="text-2xl">
                {dialogContent.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base leading-relaxed">
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>

          {actionType === "withdraw" && (
            <div className="space-y-4 my-4">
              <div className="space-y-2">
                <Label htmlFor="token">Token Address</Label>
                <Input
                  id="token"
                  placeholder="0x..."
                  value={withdrawData.token}
                  onChange={(e) =>
                    setWithdrawData({ ...withdrawData, token: e.target.value })
                  }
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={withdrawData.amount}
                  onChange={(e) =>
                    setWithdrawData({ ...withdrawData, amount: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <Alert
            variant={
              dialogContent.variant === "destructive"
                ? "destructive"
                : "default"
            }
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action will be recorded on the blockchain and cannot be
              undone.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAction} variant={dialogContent.variant}>
              {dialogContent.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
