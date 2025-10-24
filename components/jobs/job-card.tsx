"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, DollarSign, AlertCircle } from "lucide-react";
import type { Escrow } from "@/lib/web3/types";

interface JobCardProps {
  job: Escrow;
  index: number;
  hasApplied: boolean;
  isContractPaused: boolean;
  ongoingProjectsCount: number;
  onApply: (job: Escrow) => void;
}

export function JobCard({
  job,
  index,
  hasApplied,
  isContractPaused,
  ongoingProjectsCount,
  onApply,
}: JobCardProps) {
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="glass border-primary/20 p-4 md:p-6 hover:border-primary/40 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold">
                {job.projectDescription || `Job #${job.id}`}
              </h3>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {job.duration > 0 ? Math.round(job.duration) : 0} days
              </Badge>
              <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
            </div>

            <p className="text-muted-foreground mb-4 break-words overflow-hidden">
              {job.projectDescription}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>
                Budget: {(Number.parseFloat(job.totalAmount) / 1e18).toFixed(2)}{" "}
                tokens
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
            <div className="text-right w-full lg:w-auto">
              <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
              <p className="text-2xl md:text-3xl font-bold text-primary break-all">
                {(Number.parseFloat(job.totalAmount) / 1e18).toFixed(2)}
              </p>
            </div>

            <Button
              onClick={() => onApply(job)}
              disabled={
                hasApplied ||
                isContractPaused ||
                job.isJobCreator ||
                ongoingProjectsCount >= 3
              }
              className="w-full lg:w-auto min-w-[140px]"
            >
              {isContractPaused ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Contract Paused
                </>
              ) : job.isJobCreator ? (
                "Your Job"
              ) : hasApplied ? (
                "Applied"
              ) : ongoingProjectsCount >= 3 ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Project Limit (3/3)
                </>
              ) : (
                "Apply Now"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
