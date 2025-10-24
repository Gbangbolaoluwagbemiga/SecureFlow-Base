"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Escrow, Milestone } from "@/lib/web3/types";

interface MilestoneApprovalPanelProps {
  escrow: Escrow;
  onApproveMilestone: (escrowId: string, milestoneIndex: number) => void;
  onRejectMilestone: (
    escrowId: string,
    milestoneIndex: number,
    reason: string,
  ) => void;
  submittingMilestone: string | null;
  className?: string;
}

export function MilestoneApprovalPanel({
  escrow,
  onApproveMilestone,
  onRejectMilestone,
  submittingMilestone,
  className,
}: MilestoneApprovalPanelProps) {
  const submittedMilestones = escrow.milestones.filter(
    (m) => m.status === "submitted",
  );

  // Debug: Log all milestone statuses

  if (submittedMilestones.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Milestone Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">
            No milestones are currently awaiting your approval.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Milestone Approvals ({submittedMilestones.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submittedMilestones.map((milestone, index) => (
          <MilestoneApprovalItem
            key={index}
            escrow={escrow}
            milestone={milestone}
            milestoneIndex={index}
            onApproveMilestone={onApproveMilestone}
            onRejectMilestone={onRejectMilestone}
            submittingMilestone={submittingMilestone}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface MilestoneApprovalItemProps {
  escrow: Escrow;
  milestone: Milestone;
  milestoneIndex: number;
  onApproveMilestone: (escrowId: string, milestoneIndex: number) => void;
  onRejectMilestone: (
    escrowId: string,
    milestoneIndex: number,
    reason: string,
  ) => void;
  submittingMilestone: string | null;
}

function MilestoneApprovalItem({
  escrow,
  milestone,
  milestoneIndex,
  onApproveMilestone,
  onRejectMilestone,
  submittingMilestone,
}: MilestoneApprovalItemProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApproveMilestone(escrow.id, milestoneIndex);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    setIsSubmitting(true);
    try {
      await onRejectMilestone(escrow.id, milestoneIndex, rejectionReason);
      setRejectionReason("");
      setShowRejectionForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmittingThis =
    submittingMilestone === `${escrow.id}-${milestoneIndex}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4 bg-gray-50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-yellow-100 text-yellow-800">
              Milestone {milestoneIndex + 1}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              Awaiting Approval
            </Badge>
          </div>
          <p className="text-sm text-gray-700 mb-2">{milestone.description}</p>
          <p className="text-sm font-semibold text-green-600">
            {(Number.parseFloat(milestone.amount) / 1e18).toFixed(2)} tokens
          </p>
        </div>
      </div>

      {!showRejectionForm ? (
        <div className="flex gap-2">
          <Button
            onClick={handleApprove}
            disabled={isSubmittingThis || isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isSubmittingThis ? "Approving..." : "Approve"}
          </Button>
          <Button
            onClick={() => setShowRejectionForm(true)}
            disabled={isSubmittingThis || isSubmitting}
            variant="destructive"
            className="flex-1"
            size="sm"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Dispute
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please explain why you are disputing this milestone..."
            className="text-sm"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isSubmitting ? "Disputing..." : "Submit Dispute"}
            </Button>
            <Button
              onClick={() => {
                setShowRejectionForm(false);
                setRejectionReason("");
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
