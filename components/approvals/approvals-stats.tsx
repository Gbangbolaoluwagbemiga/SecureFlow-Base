"use client";

import { Card } from "@/components/ui/card";
import { Briefcase, MessageSquare, User } from "lucide-react";

interface ApprovalsStatsProps {
  jobs: Array<{
    applicationCount: number;
  }>;
}

export function ApprovalsStats({ jobs }: ApprovalsStatsProps) {
  const totalApplications = jobs.reduce(
    (sum, job) => sum + job.applicationCount,
    0,
  );
  const avgApplications =
    jobs.length > 0 ? Math.round(totalApplications / jobs.length) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
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
            <p className="text-sm text-muted-foreground mb-1">
              Total Applications
            </p>
            <p className="text-2xl md:text-3xl font-bold break-all">
              {totalApplications}
            </p>
          </div>
          <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-accent opacity-50 flex-shrink-0" />
        </div>
      </Card>

      <Card className="glass border-primary/20 p-4 md:p-6 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground mb-1">
              Avg. Applications
            </p>
            <p className="text-2xl md:text-3xl font-bold break-all">
              {avgApplications}
            </p>
          </div>
          <User className="h-8 w-8 md:h-10 md:w-10 text-primary opacity-50 flex-shrink-0" />
        </div>
      </Card>
    </div>
  );
}
