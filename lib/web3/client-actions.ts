/**
 * Client Actions Interface
 * Comprehensive interface for clients to manage milestones
 */

export interface ClientMilestoneAction {
  action: "approve" | "reject" | "dispute";
  escrowId: string;
  milestoneIndex: number;
  reason?: string; // Required for reject and dispute
}

export interface ClientActionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  message: string;
}

export interface MilestoneActionButton {
  label: string;
  variant: "default" | "destructive" | "outline";
  icon: string;
  disabled: boolean;
  requiresReason: boolean;
}

export const CLIENT_ACTIONS: Record<string, MilestoneActionButton> = {
  approve: {
    label: "Approve & Release",
    variant: "default",
    icon: "CheckCircle2",
    disabled: false,
    requiresReason: false,
  },
  reject: {
    label: "Reject",
    variant: "outline",
    icon: "XCircle",
    disabled: false,
    requiresReason: true,
  },
  dispute: {
    label: "Dispute",
    variant: "destructive",
    icon: "Gavel",
    disabled: false,
    requiresReason: true,
  },
};

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  milestoneSubmitted: boolean;
  milestoneApproved: boolean;
  milestoneRejected: boolean;
  milestoneDisputed: boolean;
  disputeResolved: boolean;
  escrowCompleted: boolean;
}

export interface NotificationConfig {
  webhookUrl?: string;
  emailService?: "sendgrid" | "mailgun" | "ses";
  pushService?: "firebase" | "onesignal" | "pusher";
  realTimeService?: "socketio" | "pusher" | "ably";
}




