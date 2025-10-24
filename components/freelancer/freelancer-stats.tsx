"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  Pause,
  AlertTriangle,
} from "lucide-react";

interface FreelancerStatsProps {
  escrows: Array<{
    totalAmount: string;
    releasedAmount: string;
    status: string;
    milestones: Array<{
      status: string;
    }>;
  }>;
}

export function FreelancerStats({ escrows }: FreelancerStatsProps) {
  const totalEarnings = escrows.reduce(
    (sum, escrow) => sum + Number.parseFloat(escrow.releasedAmount),
    0,
  );

  const totalValue = escrows.reduce(
    (sum, escrow) => sum + Number.parseFloat(escrow.totalAmount),
    0,
  );

  // Helper function to check if an escrow is terminated
  const isEscrowTerminated = (escrow: any) => {
    return escrow.milestones.some(
      (milestone: any) =>
        milestone.status === "disputed" || milestone.status === "rejected",
    );
  };

  const completedProjects = escrows.filter((escrow) => {
    // A project is completed if all milestones are approved
    if (escrow.milestones.length === 0) return false;
    return escrow.milestones.every(
      (milestone) => milestone.status === "approved",
    );
  }).length;

  const activeProjects = escrows.filter((escrow) => {
    // A project is active if it has milestones but not all are approved AND not terminated
    if (escrow.milestones.length === 0) return false;
    if (isEscrowTerminated(escrow)) return false; // Exclude terminated projects

    const hasApprovedMilestones = escrow.milestones.some(
      (milestone) => milestone.status === "approved",
    );
    const allMilestonesApproved = escrow.milestones.every(
      (milestone) => milestone.status === "approved",
    );
    return hasApprovedMilestones && !allMilestonesApproved;
  }).length;

  const pendingProjects = escrows.filter((escrow) => {
    // A project is pending if no milestones have been approved yet AND not terminated
    if (escrow.milestones.length === 0) return false;
    if (isEscrowTerminated(escrow)) return false; // Exclude terminated projects

    return escrow.milestones.every(
      (milestone) => milestone.status === "pending",
    );
  }).length;

  // Count terminated projects (disputed/rejected milestones)
  const terminatedProjects = escrows.filter((escrow) => {
    return isEscrowTerminated(escrow);
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 mb-8">
      <Card className="glass border-primary/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(totalEarnings / 1e18).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">tokens earned</p>
        </CardContent>
      </Card>

      <Card className="glass border-accent/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(totalValue / 1e18).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">tokens in projects</p>
        </CardContent>
      </Card>

      <Card className="glass border-primary/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedProjects}</div>
          <p className="text-xs text-muted-foreground">projects</p>
        </CardContent>
      </Card>

      <Card className="glass border-primary/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeProjects}</div>
          <p className="text-xs text-muted-foreground">projects</p>
        </CardContent>
      </Card>

      <Card className="glass border-primary/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Pause className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingProjects}</div>
          <p className="text-xs text-muted-foreground">projects</p>
        </CardContent>
      </Card>

      <Card className="glass border-destructive/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Terminated</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{terminatedProjects}</div>
          <p className="text-xs text-muted-foreground">projects</p>
        </CardContent>
      </Card>
    </div>
  );
}
