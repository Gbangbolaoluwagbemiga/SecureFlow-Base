"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useWeb3 } from "@/contexts/web3-context";
import { useToast } from "@/hooks/use-toast";
import { CONTRACTS } from "@/lib/web3/config";
import { SECUREFLOW_ABI } from "@/lib/web3/abis";
import {
  useNotifications,
  createApplicationNotification,
} from "@/contexts/notification-context";
import type { Escrow } from "@/lib/web3/types";
import { Briefcase } from "lucide-react";
import { JobsHeader } from "@/components/jobs/jobs-header";
import { JobsStats } from "@/components/jobs/jobs-stats";
import { JobCard } from "@/components/jobs/job-card";
import { ApplicationDialog } from "@/components/jobs/application-dialog";
import { JobsLoading } from "@/components/jobs/jobs-loading";

export default function JobsPage() {
  const { wallet, getContract } = useWeb3();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [jobs, setJobs] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Escrow | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedTimeline, setProposedTimeline] = useState("");
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState<Record<string, boolean>>({});
  const [isContractPaused, setIsContractPaused] = useState(false);
  const [ongoingProjectsCount, setOngoingProjectsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const getStatusFromNumber = (status: number): "pending" | "disputed" | "active" | "completed" => {
    switch (status) {
      case 0:
        return "pending";
      case 1:
        return "active";
      case 2:
        return "completed";
      case 3:
        return "disputed";
      case 4:
        return "pending"; // Map cancelled to pending
      default:
        return "pending";
    }
  };

  useEffect(() => {
    if (wallet.address) {
      fetchOpenJobs();
      countOngoingProjects();
    } else {
    }
    checkContractPauseStatus();
  }, [wallet.address]);

  // Removed automatic refresh to prevent constant reloading

  // Check application status when jobs are loaded
  useEffect(() => {
    if (wallet.address && jobs.length > 0) {
      checkApplicationStatus();
    }
  }, [wallet.address, jobs]);

  // Removed duplicate project count refresh

  const checkContractPauseStatus = async () => {
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);
      const paused = await contract.call("paused");

      let isPaused = false;

      // Use the same robust parsing logic as admin page
      if (paused === true || paused === "true" || paused === 1) {
        isPaused = true;
      } else if (paused === false || paused === "false" || paused === 0) {
        isPaused = false;
      } else if (paused && typeof paused === "object") {
        try {
          const pausedValue = paused.toString();
          isPaused = pausedValue === "true" || pausedValue === "1";
        } catch (e) {
          isPaused = false; // Default to not paused
        }
      }

      setIsContractPaused(isPaused);
    } catch (error) {
      setIsContractPaused(false);
    }
  };

  const countOngoingProjects = async () => {
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);

      // Get total number of escrows
      const totalEscrows = await contract.call("nextEscrowId");
      const escrowCount = Number(totalEscrows);

      let ongoingCount = 0;

      // Check all escrows to count ongoing projects for this user (both as client and freelancer)
      if (escrowCount > 1) {
        for (let i = 1; i < escrowCount; i++) {
          try {
            const escrowSummary = await contract.call("getEscrowSummary", i);

            const payerAddress = escrowSummary[0]; // depositor/client
            const beneficiaryAddress = escrowSummary[1]; // beneficiary/freelancer
            const userAddress = wallet.address;

            // Check if current user is either the payer (client) or beneficiary (freelancer)
            const isPayer =
              payerAddress &&
              userAddress &&
              payerAddress.toLowerCase() === userAddress.toLowerCase();
            const isBeneficiary =
              beneficiaryAddress &&
              userAddress &&
              beneficiaryAddress.toLowerCase() === userAddress.toLowerCase();

            // Count projects where user is involved (as client or freelancer)
            if (isPayer || isBeneficiary) {
              const status = Number(escrowSummary[3]); // status is at index 3
              // Count active and pending projects (status 0 = pending, 1 = active)
              // Also count any project that's not completed, disputed, or cancelled
              if (status === 0 || status === 1) {
                ongoingCount++;
              }
            }
          } catch (error) {
            // Skip escrows that don't exist or can't be accessed
            continue;
          }
        }
      }

      setOngoingProjectsCount(ongoingCount);
    } catch (error) {
      setOngoingProjectsCount(0);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);
      const applicationStatus: Record<string, boolean> = {};

      for (const job of jobs) {
        try {
          // Check if user has applied to this job
          const hasUserApplied = await contract.call(
            "hasUserApplied",
            job.id,
            wallet.address,
          );
          applicationStatus[job.id] = Boolean(hasUserApplied);
        } catch (error) {
          // Error checking application status
          // If we can't check, assume they haven't applied to be safe
          applicationStatus[job.id] = false;
        }
      }

      setHasApplied(applicationStatus);
    } catch (error) {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchOpenJobs(), countOngoingProjects()]);
      // Check application status after refreshing jobs
      if (wallet.address && jobs.length > 0) {
        await checkApplicationStatus();
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Clear application status cache when wallet changes
  useEffect(() => {
    setHasApplied({});
  }, [wallet.address]);

  const fetchOpenJobs = async () => {
    setLoading(true);
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);

      // Get total number of escrows
      const totalEscrows = await contract.call("nextEscrowId");
      const escrowCount = Number(totalEscrows);

      const openJobs: Escrow[] = [];

      // Fetch open jobs from the contract
      // Check if there are any escrows created yet (nextEscrowId > 1 means at least one escrow exists)
      if (escrowCount > 1) {
        for (let i = 1; i < escrowCount; i++) {
          try {
            const escrowSummary = await contract.call("getEscrowSummary", i);

            // Check if this is an open job (beneficiary is zero address)
            // getEscrowSummary returns indexed properties: [depositor, beneficiary, arbiters, status, totalAmount, paidAmount, remaining, token, deadline, workStarted, createdAt, milestoneCount, isOpenJob, projectTitle, projectDescription]
            const isOpenJob =
              escrowSummary[1] === "0x0000000000000000000000000000000000000000";

            if (isOpenJob) {
              // Check if current user is the job creator (should not be able to apply to own job)
              const isJobCreator =
                escrowSummary[0].toLowerCase() ===
                wallet.address?.toLowerCase();

              // Check if current user has already applied to this job
              let userHasApplied = false;
              if (wallet.address && !isJobCreator) {
                try {
                  const hasAppliedResult = await contract.call(
                    "hasUserApplied",
                    i,
                    wallet.address,
                  );

                  // Handle different possible return types - be more strict about what counts as "applied"
                  if (
                    hasAppliedResult &&
                    typeof hasAppliedResult === "object"
                  ) {
                    // Handle Proxy(Result) objects
                    try {
                      const resultValue =
                        hasAppliedResult[0] || hasAppliedResult.toString();
                      userHasApplied =
                        resultValue === true ||
                        resultValue === "true" ||
                        resultValue === 1 ||
                        resultValue === "1";
                    } catch (e) {
                      userHasApplied = false;
                    }
                  } else {
                    userHasApplied =
                      hasAppliedResult === true ||
                      hasAppliedResult === "true" ||
                      hasAppliedResult === 1;
                  }

                  // Update the hasApplied state for this job
                  setHasApplied((prev) => ({
                    ...prev,
                    [i]: userHasApplied,
                  }));

                  // If hasUserApplied returned false, try to double-check with applications list
                  if (!userHasApplied) {
                    try {
                      // Try to get applications with a smaller limit first
                      let applications = null;
                      try {
                        applications = await contract.call(
                          "getApplicationsPage",
                          i, // escrowId
                          0, // offset
                          1, // limit - start with 1
                        );
                      } catch (error1) {
                        try {
                          applications = await contract.call(
                            "getApplicationsPage",
                            i, // escrowId
                            0, // offset
                            10, // limit - try 10
                          );
                        } catch (error2) {
                          throw error2;
                        }
                      }

                      if (applications && Array.isArray(applications)) {
                        const userInApplications = applications.some(
                          (app: any) =>
                            app.freelancer &&
                            app.freelancer.toLowerCase() ===
                              wallet.address?.toLowerCase(),
                        );

                        if (userInApplications) {
                          userHasApplied = true;
                          setHasApplied((prev) => ({
                            ...prev,
                            [i]: true,
                          }));
                        }
                      }
                    } catch (appError) {
                      // Could not fetch applications during double-check
                    }
                  }
                } catch (error) {
                  // Error checking application status
                  // If check fails, assume they haven't applied
                  userHasApplied = false;
                }
              } else {
              }

              // Fetch application count for this job
              let applicationCount = 0;
              try {
                const applications = await contract.call(
                  "getApplicationsPage",
                  i, // escrowId
                  0, // offset
                  100, // limit
                );
                applicationCount = applications ? applications.length : 0;
              } catch (error) {
                // Could not fetch applications
                applicationCount = 0;
              }

              // Convert contract data to our Escrow type
              const job: Escrow = {
                id: i.toString(),
                payer: escrowSummary[0], // depositor
                beneficiary: escrowSummary[1], // beneficiary
                token: escrowSummary[7], // token
                totalAmount: escrowSummary[4].toString(), // totalAmount
                releasedAmount: escrowSummary[5].toString(), // paidAmount
                status: getStatusFromNumber(Number(escrowSummary[3])), // status
                createdAt: Number(escrowSummary[10]) * 1000, // createdAt (convert to milliseconds)
                duration: Math.max(
                  0,
                  Math.round(
                    (Number(escrowSummary[8]) - Number(escrowSummary[10])) /
                      (24 * 60 * 60),
                  ),
                ), // Convert seconds to days, ensure non-negative and round to nearest day
                milestones: [], // Would need to fetch milestones separately
                // projectTitle: escrowSummary[13] || "", // projectTitle - removed as not in Escrow interface
                projectDescription: escrowSummary[14] || "", // projectDescription
                isOpenJob: true,
                applications: [], // Would need to fetch applications separately
                applicationCount: applicationCount, // Add real application count
                isJobCreator: isJobCreator, // Add flag to track if current user is the job creator
              };

              openJobs.push(job);

              // Store application status
              setHasApplied((prev) => ({
                ...prev,
                [job.id]: userHasApplied,
              }));
            }
          } catch (error) {
            // Skip escrows that don't exist or user doesn't have access to
            continue;
          }
        }
      }

      // Set the actual jobs from the contract
      setJobs(openJobs);
    } catch (error) {
      toast({
        title: "Failed to load jobs",
        description: "Could not fetch available jobs from the blockchain",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (
    job: Escrow,
    coverLetter: string,
    proposedTimeline: string,
  ) => {
    if (!job || !wallet.isConnected) return;

    // Check if freelancer has reached the maximum number of ongoing projects (3)
    if (ongoingProjectsCount >= 3) {
      toast({
        title: "Project Limit Reached",
        description:
          "You can only have a maximum of 3 ongoing projects at a time. Please complete or cancel some projects before applying to new ones.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has already applied to this job (local state)
    if (hasApplied[job.id]) {
      toast({
        title: "Already Applied",
        description: "You have already applied to this job.",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);
    try {
      const contract = getContract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI);
      if (!contract) return;

      // Double-check with blockchain to prevent duplicate applications

      let userHasApplied = false;

      try {
        // First try the hasUserApplied function
        const hasUserAppliedResult = await contract.call(
          "hasUserApplied",
          job.id,
          wallet.address,
        );

        // Handle different return types including Proxy(Result) objects
        if (hasUserAppliedResult && typeof hasUserAppliedResult === "object") {
          try {
            const resultValue =
              hasUserAppliedResult[0] || hasUserAppliedResult.toString();
            userHasApplied =
              resultValue === true ||
              resultValue === "true" ||
              resultValue === 1 ||
              resultValue === "1";
          } catch (e) {
            userHasApplied = false;
          }
        } else {
          userHasApplied =
            hasUserAppliedResult === true ||
            hasUserAppliedResult === "true" ||
            hasUserAppliedResult === 1;
        }
      } catch (checkError) {
        userHasApplied = false;
      }

      // If hasUserApplied failed or returned false, try alternative method
      if (!userHasApplied) {
        try {
          const applications = await contract.call(
            "getApplicationsPage",
            job.id,
            0, // offset
            100, // limit
          );

          if (applications && Array.isArray(applications)) {
            // Check if current user is in the applications list
            userHasApplied = applications.some((app: any) => {
              const freelancerAddress = app.freelancer || app[0]; // Try different possible structures
              return (
                freelancerAddress &&
                freelancerAddress.toLowerCase() === wallet.address?.toLowerCase()
              );
            });
          }
        } catch (altError) {}
      }

      if (userHasApplied) {
        toast({
          title: "Already Applied",
          description: "You have already applied to this job.",
          variant: "destructive",
        });
        setApplying(false);
        return;
      } else {
      }

      // Call the smart contract applyToJob function
      await contract.send(
        "applyToJob",
        "no-value",
        job.id,
        coverLetter,
        proposedTimeline,
      );

      toast({
        title: "Application Submitted!",
        description:
          "The client will review your application and get back to you.",
      });

      // Add notification for job application submission - notify the CLIENT (job creator)
      addNotification(
        createApplicationNotification("submitted", Number(job.id), wallet.address!, {
          jobTitle: job.projectDescription || `Job #${job.id}`,
          freelancerName:
            wallet.address!.slice(0, 6) + "..." + wallet.address!.slice(-4),
        }),
        [job.payer], // Notify the client (job creator)
      );

      setCoverLetter("");
      setProposedTimeline("");
      setSelectedJob(null);

      // Update the application status for this specific job
      setHasApplied((prev) => ({
        ...prev,
        [job.id]: true,
      }));

      // Refresh the jobs list to update application counts
      await fetchOpenJobs();

      // Refresh the ongoing projects count
      await countOngoingProjects();
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "Could not submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.projectDescription
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      job.milestones.some((m) =>
        m.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  if (!wallet.isConnected || loading) {
    return <JobsLoading isConnected={wallet.isConnected} />;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <JobsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        <JobsStats jobs={jobs} ongoingProjectsCount={ongoingProjectsCount} />

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <Card className="glass border-muted p-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No jobs found matching your search
              </p>
            </Card>
          ) : (
            filteredJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                hasApplied={hasApplied[job.id] || false}
                isContractPaused={isContractPaused}
                ongoingProjectsCount={ongoingProjectsCount}
                onApply={setSelectedJob}
              />
            ))
          )}
        </div>

        <ApplicationDialog
          job={selectedJob}
          open={!!selectedJob}
          onOpenChange={(open) => !open && setSelectedJob(null)}
          onApply={handleApply}
          applying={applying}
        />
      </div>
    </div>
  );
}
