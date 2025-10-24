"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Shield, CheckCircle2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/contexts/web3-context";
import { CONTRACTS } from "@/lib/web3/config";
import { SECUREFLOW_ABI } from "@/lib/web3/abis";
import { motion } from "framer-motion";

export default function HomePage() {
  const { wallet, getContract } = useWeb3();
  const [stats, setStats] = useState({
    activeEscrows: 0,
    totalVolume: "0",
    completedEscrows: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wallet.isConnected) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [wallet.isConnected]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);

      // Get total number of escrows
      const totalEscrows = await contract.call("nextEscrowId");
      const escrowCount = Number(totalEscrows);

      let activeEscrows = 0;
      let completedEscrows = 0;
      let totalVolume = 0;

      // Helper function to check if an escrow is terminated
      const isEscrowTerminated = async (escrowId: number) => {
        try {
          const milestones = await contract.call("getMilestones", escrowId);
          for (let j = 0; j < milestones.length; j++) {
            const milestone = milestones[j];
            const milestoneStatus = Number(milestone[2]); // status is at index 2
            if (milestoneStatus === 3 || milestoneStatus === 4) {
              // disputed or rejected
              return true;
            }
          }
        } catch (error) {
          // If we can't check milestones, assume not terminated
        }
        return false;
      };

      // Count escrows by status
      // Check if there are any escrows created yet (nextEscrowId > 1 means at least one escrow exists)
      if (escrowCount > 1) {
        for (let i = 1; i < escrowCount; i++) {
          try {
            const escrowSummary = await contract.call("getEscrowSummary", i);
            const status = Number(escrowSummary[3]); // status is at index 3
            const totalAmount = Number(escrowSummary[4]); // totalAmount is at index 4

            // Add to total volume (convert from Wei to tokens)
            totalVolume += totalAmount / 1e18;

            if (status === 1) {
              // Check if this active escrow is terminated due to disputed milestones
              const isTerminated = await isEscrowTerminated(i);
              if (!isTerminated) {
                activeEscrows++;
              } else {
                // Terminated projects should be counted as completed
                completedEscrows++;
              }
            } else if (status === 2) {
              // Completed
              completedEscrows++;
            }
          } catch (error) {
            // Skip escrows that don't exist
            continue;
          }
        }
      }

      setStats({
        activeEscrows,
        totalVolume: totalVolume.toFixed(2),
        completedEscrows,
      });
    } catch (error) {
      // Set empty stats if contract call fails
      setStats({
        activeEscrows: 0,
        totalVolume: "0",
        completedEscrows: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />

        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium">
                Powered by Base Sepolia
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
              Trustless Payments.{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Transparent Milestones.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto leading-relaxed">
              Secure escrow smart contracts for freelancers and clients. Release
              payments based on verified milestones with complete transparency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button size="lg" className="gap-2 text-lg px-8 glow-primary">
                  Create Escrow
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-lg px-8 bg-transparent"
                >
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20"
          >
            <Card className="glass border-primary/20 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {loading ? (
                  <span className="animate-pulse text-muted-foreground">…</span>
                ) : (
                  stats.activeEscrows
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Escrows
              </div>
            </Card>

            <Card className="glass border-accent/20 p-6 text-center glow-accent">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {loading ? (
                  <span className="animate-pulse text-muted-foreground">
                    $...
                  </span>
                ) : (
                  `$${stats.totalVolume}`
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Volume Secured
              </div>
            </Card>

            <Card className="glass border-primary/20 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {loading ? (
                  <span className="animate-pulse text-muted-foreground">…</span>
                ) : (
                  stats.completedEscrows
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Completed Projects
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              How SecureFlow Works
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Simple, secure, and transparent escrow for the Web3 era
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="glass p-8 h-full border-primary/20">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Create Escrow</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Set up your project with milestones, amounts, and deadlines.
                  Funds are locked in the smart contract until conditions are
                  met.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass p-8 h-full border-accent/20">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-6">
                  <span className="text-2xl font-bold text-accent">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Track Progress</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Freelancers submit completed milestones for review. Both
                  parties can track progress in real-time on the blockchain.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="glass p-8 h-full border-primary/20">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Release Funds</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Approve milestones to automatically release payments. Dispute
                  resolution available if needed.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        <div className="container relative mx-auto px-4">
          <Card className="glass border-primary/20 p-12 max-w-4xl mx-auto text-center glow-primary">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Ready to secure your next project?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Join hundreds of freelancers and clients using SecureFlow for
              trustless payments
            </p>
            <Link href="/create">
              <Button size="lg" className="gap-2 text-lg px-8">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
