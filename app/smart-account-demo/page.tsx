"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSmartAccount } from "@/contexts/smart-account-context";
import { useDelegation } from "@/contexts/delegation-context";
import { useWeb3 } from "@/contexts/web3-context";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Users,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Gavel,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SmartAccountDemoPage() {
  const { smartAccount, deploySmartAccount, isSmartAccountReady } =
    useSmartAccount();
  const {
    delegations,
    createDelegation,
    revokeDelegation,
    getActiveDelegations,
  } = useDelegation();
  const { wallet, getContract } = useWeb3();
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploySmartAccount = async () => {
    try {
      setIsDeploying(true);
      await deploySmartAccount();
    } catch (error) {
      console.error("Deployment failed:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCreateDelegation = async () => {
    try {
      if (!wallet.isConnected) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }

      // Delegate to the currently connected wallet for access testing
      const delegatee = wallet.address!;
      const functions = ["approveMilestone", "disputeMilestone"];
      const duration = 24 * 60 * 60; // 24 hours

      await createDelegation(delegatee, functions, duration);
    } catch (error) {
      console.error("Delegation creation failed:", error);
    }
  };

  const activeDelegations = getActiveDelegations();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Smart Account Demo
              </h1>
              <p className="text-xl text-muted-foreground">
                Showcasing Smart Account features for hackathon judges
              </p>
            </div>
          </div>

          {/* Smart Account Status */}
          <Card className="glass border-primary/20 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Smart Account Status
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    {isSmartAccountReady ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  {smartAccount.safeAddress && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Address:</span>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {smartAccount.safeAddress.slice(0, 6)}...
                        {smartAccount.safeAddress.slice(-4)}
                      </code>
                    </div>
                  )}
                </div>
              </div>
              {!smartAccount.isDeployed && (
                <Button
                  onClick={handleDeploySmartAccount}
                  disabled={isDeploying}
                  className="gap-2"
                >
                  {isDeploying ? "Deploying..." : "Deploy Smart Account"}
                </Button>
              )}
            </div>
          </Card>

          {/* Delegation System */}
          <Card className="glass border-accent/20 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Delegation System</h3>
                <p className="text-muted-foreground mb-4">
                  Delegate admin functions to arbiters and trusted parties.
                  Enable decentralized dispute resolution.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button onClick={handleCreateDelegation} className="gap-2">
                      <Users className="h-4 w-4" />
                      Create Delegation
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {activeDelegations.length} active delegations
                    </span>
                  </div>

                  {activeDelegations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Active Delegations:</h4>
                      {activeDelegations.map((delegation) => (
                        <div
                          key={delegation.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <span className="font-medium">
                              {delegation.delegatee.slice(0, 6)}...
                              {delegation.delegatee.slice(-4)}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {delegation.functions.length} functions
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => revokeDelegation(delegation.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Demo Scenarios */}
          <Card className="glass border-primary/20 p-6">
            <h3 className="text-xl font-bold mb-4">
              Demo Scenarios for Judges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  Scenario 1: Gasless Milestone Approval
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Client approves milestone without paying gas fees using Smart
                  Account.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Zero gas fees</span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  Scenario 2: Batch Operations
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Approve multiple milestones in a single transaction.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Send className="h-4 w-4 text-blue-500" />
                  <span>Efficient batching</span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  Scenario 3: Delegated Admin
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Arbiters can resolve disputes using delegated admin functions.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Gavel className="h-4 w-4 text-purple-500" />
                  <span>Decentralized resolution</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
