"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Clock, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { MilestoneActions } from "@/components/milestone-actions";
import type { Escrow, Milestone } from "@/lib/web3/types";

interface EscrowCardProps {
  escrow: Escrow;
  index: number;
  expandedEscrow: string | null;
  submittingMilestone: string | null;
  onToggleExpanded: (escrowId: string) => void;
  onApproveMilestone: (escrowId: string, milestoneIndex: number) => void;
  onRejectMilestone: (escrowId: string, milestoneIndex: number) => void;
  onDisputeMilestone: (escrowId: string, milestoneIndex: number) => void;
  onStartWork: (escrowId: string) => void;
  onDispute: (escrowId: string) => void;
  calculateDaysLeft: (createdAt: number, duration: number) => number;
  getDaysLeftMessage: (daysLeft: number) => {
    text: string;
    color: string;
    bgColor: string;
  };
}

export function EscrowCard({
  escrow,
  index,
  expandedEscrow,
  submittingMilestone,
  onToggleExpanded,
  onApproveMilestone,
  onRejectMilestone,
  onDisputeMilestone,
  onStartWork,
  onDispute,
  calculateDaysLeft,
  getDaysLeftMessage,
}: EscrowCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      case "resolved":
        return "bg-purple-100 text-purple-800";
      case "terminated":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if this escrow should be marked as terminated
  const isTerminated = escrow.milestones.some(
    (milestone) =>
      milestone.status === "disputed" ||
      milestone.status === "rejected" ||
      milestone.status === "resolved"
  );

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      case "resolved":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const progressPercentage =
    escrow.totalAmount !== "0"
      ? (Number.parseFloat(escrow.releasedAmount) /
          Number.parseFloat(escrow.totalAmount)) *
        100
      : 0;

  const completedMilestones = escrow.milestones.filter(
    (m) => m.status === "approved"
  ).length;
  const totalMilestones = escrow.milestones.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="glass border-primary/20 p-4 md:p-6 hover:border-primary/40 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">
                {escrow.projectDescription}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.round(escrow.duration / (24 * 60 * 60))} days
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {(Number.parseFloat(escrow.totalAmount) / 1e18).toFixed(2)}{" "}
                    tokens
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={getStatusColor(
                  isTerminated ? "terminated" : escrow.status
                )}
              >
                {isTerminated ? "terminated" : escrow.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpanded(escrow.id)}
                className="cursor-pointer"
              >
                {expandedEscrow === escrow.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span>
                  {completedMilestones}/{totalMilestones} milestones
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <div className="font-semibold">
                  {(Number.parseFloat(escrow.totalAmount) / 1e18).toFixed(2)}{" "}
                  tokens
                </div>
              </div>
              <div>
                <span className="text-gray-600">Released:</span>
                <div className="font-semibold">
                  {(Number.parseFloat(escrow.releasedAmount) / 1e18).toFixed(2)}{" "}
                  tokens
                </div>
              </div>
              <div>
                <span className="text-gray-600">Days Left:</span>
                <div className="font-semibold flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {(() => {
                    const daysLeft = calculateDaysLeft(
                      escrow.createdAt,
                      escrow.duration
                    );
                    const message = getDaysLeftMessage(daysLeft);
                    return (
                      <span className={message.color}>{message.text}</span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {expandedEscrow === escrow.id && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <h4 className="font-medium">Milestones:</h4>
                  {escrow.milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-muted/20 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {milestone.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(Number.parseFloat(milestone.amount) / 1e18).toFixed(
                            2
                          )}{" "}
                          tokens
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getMilestoneStatusColor(milestone.status)}
                        >
                          {milestone.status}
                        </Badge>
                        <MilestoneActions
                          escrowId={escrow.id}
                          milestoneIndex={idx}
                          milestone={milestone}
                          isPayer={escrow.isClient || false}
                          isBeneficiary={escrow.isFreelancer || false}
                          escrowStatus={escrow.status}
                          allMilestones={escrow.milestones}
                          showSubmitButton={false} // Hide submit buttons on dashboard
                          payerAddress={escrow.payer} // Client address for notifications
                          beneficiaryAddress={escrow.beneficiary} // Freelancer address for notifications
                          onSuccess={() => {
                            // Refresh the escrow data
                            window.dispatchEvent(
                              new CustomEvent("escrowUpdated")
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
