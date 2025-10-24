"use client";

import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface FreelancerLoadingProps {
  isConnected: boolean;
}

export function FreelancerLoading({ isConnected }: FreelancerLoadingProps) {
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <Card className="glass border-primary/20 p-12 text-center max-w-md">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to view your freelance projects
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
        <p className="text-muted-foreground">Loading your projects...</p>
      </div>
    </div>
  );
}
