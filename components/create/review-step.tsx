"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, DollarSign, User, Zap } from "lucide-react";
import { useSmartAccount } from "@/contexts/smart-account-context";

interface Milestone {
  description: string;
  amount: string;
}

interface ReviewStepProps {
  formData: {
    projectTitle: string;
    projectDescription: string;
    duration: string;
    totalBudget: string;
    beneficiary: string;
    token: string;
    useNativeToken: boolean;
    isOpenJob: boolean;
    milestones: Milestone[];
  };
  onConfirm: () => void;
  isSubmitting: boolean;
  isContractPaused: boolean;
  isOnCorrectNetwork?: boolean;
}

export function ReviewStep({
  formData,
  onConfirm,
  isSubmitting,
  isContractPaused,
  isOnCorrectNetwork = true,
}: ReviewStepProps) {
  const { isSmartAccountReady } = useSmartAccount();
  const totalMilestoneAmount = formData.milestones.reduce(
    (sum, milestone) => sum + Number.parseFloat(milestone.amount || "0"),
    0
  );

  const isTotalValid =
    Math.abs(totalMilestoneAmount - Number.parseFloat(formData.totalBudget)) <
    0.01;

  return (
    <Card className="glass border-primary/20 p-6">
      <CardHeader>
        <CardTitle>Review & Confirm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">
              {formData.projectTitle}
            </h3>
            <p className="text-muted-foreground">
              {formData.projectDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formData.duration} days</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formData.totalBudget} tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formData.isOpenJob ? "Open Job" : "Direct Assignment"}
              </span>
            </div>
          </div>

          {formData.beneficiary && (
            <div>
              <p className="text-sm text-muted-foreground">Beneficiary:</p>
              <p className="font-mono text-sm">{formData.beneficiary}</p>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">
              Milestones ({formData.milestones.length})
            </h4>
            <div className="space-y-2">
              {formData.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded"
                >
                  <span className="text-sm">{milestone.description}</span>
                  <span className="text-sm font-medium">
                    {milestone.amount} tokens
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Milestone Amount:</span>
              <span className="font-semibold">
                {totalMilestoneAmount.toFixed(2)} tokens
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Project Budget:</span>
              <span className="font-semibold">
                {formData.totalBudget} tokens
              </span>
            </div>
            {!isTotalValid && (
              <p className="text-sm text-destructive mt-2">
                ⚠️ Milestone amounts don't match project budget
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onConfirm}
            disabled={
              isSubmitting ||
              isContractPaused ||
              !isTotalValid ||
              !isOnCorrectNetwork
            }
            className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "Creating Escrow..."
            ) : isSmartAccountReady ? (
              <>
                <Zap className="h-4 w-4" />
                Create Gasless Escrow
              </>
            ) : (
              "Create Escrow"
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
