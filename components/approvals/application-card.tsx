"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { User, Calendar, CheckCircle } from "lucide-react";

interface Application {
  freelancerAddress: string;
  coverLetter: string;
  proposedTimeline: number;
  appliedAt: number;
  status: "pending" | "accepted" | "rejected";
}

interface ApplicationCardProps {
  application: Application;
  index: number;
  onApprove: (freelancer: string) => void;
  approving: boolean;
}

export function ApplicationCard({
  application,
  index,
  onApprove,
  approving,
}: ApplicationCardProps) {
  return (
    <Card key={index} className="p-4 border-border/40">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">
              {application.freelancerAddress.slice(0, 6)}...
              {application.freelancerAddress.slice(-4)}
            </span>
            <Badge
              variant="secondary"
              className="text-xs bg-blue-100 text-blue-800"
            >
              <Calendar className="h-3 w-3 mr-1" />
              {isNaN(application.proposedTimeline) ||
              application.proposedTimeline === 0
                ? "Timeline not specified"
                : `Proposes ${application.proposedTimeline} days`}
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Proposed Timeline:</Label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm font-medium text-blue-800">
                {isNaN(application.proposedTimeline) ||
                application.proposedTimeline === 0
                  ? "Timeline not specified by freelancer"
                  : `${application.proposedTimeline} days`}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Cover Letter:</Label>
              <div className="bg-muted/20 rounded-lg p-3 text-sm break-words">
                {application.coverLetter || "No cover letter provided"}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            Applied:{" "}
            {application.appliedAt && application.appliedAt > 0
              ? new Date(application.appliedAt).toLocaleString()
              : "Unknown date"}
          </div>
        </div>

        <div className="flex justify-end w-full lg:w-auto">
          <Button
            onClick={() => {
              onApprove(application.freelancerAddress);
            }}
            disabled={approving}
            className="px-6 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 cursor-pointer"
            size="sm"
          >
            {approving ? "Approving..." : "Approve Application"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
