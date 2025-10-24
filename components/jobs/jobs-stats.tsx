"use client";

import { Card } from "@/components/ui/card";
import { Briefcase, DollarSign, Clock, User } from "lucide-react";

interface JobsStatsProps {
  jobs: Array<{
    totalAmount: string;
    duration: number;
  }>;
  ongoingProjectsCount?: number;
}

export function JobsStats({ jobs, ongoingProjectsCount = 0 }: JobsStatsProps) {
  const totalValue = jobs.reduce(
    (sum, job) => sum + Number.parseFloat(job.totalAmount),
    0,
  );
  const avgDuration =
    jobs.length > 0
      ? jobs.reduce((sum, job) => sum + job.duration, 0) / jobs.length
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <Card className="glass border-primary/20 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground mb-1">Open Jobs</p>
            <p className="text-2xl md:text-3xl font-bold break-all">
              {jobs.length}
            </p>
          </div>
          <Briefcase className="h-8 w-8 md:h-10 md:w-10 text-primary opacity-50 flex-shrink-0" />
        </div>
      </Card>

      <Card className="glass border-accent/20 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-2xl md:text-3xl font-bold break-all">
              {(totalValue / 1e18).toFixed(2)} tokens
            </p>
          </div>
          <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-accent opacity-50 flex-shrink-0" />
        </div>
      </Card>

      <Card className="glass border-primary/20 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground mb-1">Avg. Duration</p>
            <p className="text-2xl md:text-3xl font-bold break-all">
              {Math.round(avgDuration / (24 * 60 * 60))} days
            </p>
          </div>
          <Clock className="h-8 w-8 md:h-10 md:w-10 text-primary opacity-50 flex-shrink-0" />
        </div>
      </Card>

      <Card
        className={`glass p-4 md:p-6 ${ongoingProjectsCount >= 3 ? "border-red-200 dark:border-red-800" : "border-accent/20"}`}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground mb-1">Your Projects</p>
            <p
              className={`text-2xl md:text-3xl font-bold break-all ${ongoingProjectsCount >= 3 ? "text-red-600 dark:text-red-400" : "text-accent"}`}
            >
              {ongoingProjectsCount}/3
            </p>
            {ongoingProjectsCount >= 3 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Limit reached
              </p>
            )}
          </div>
          <User
            className={`h-8 w-8 md:h-10 md:w-10 opacity-50 flex-shrink-0 ${ongoingProjectsCount >= 3 ? "text-red-600 dark:text-red-400" : "text-accent"}`}
          />
        </div>
      </Card>
    </div>
  );
}
