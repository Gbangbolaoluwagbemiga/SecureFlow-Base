export interface Milestone {
  description: string;
  amount: string;
  status:
    | "pending"
    | "submitted"
    | "approved"
    | "rejected"
    | "disputed"
    | "resolved";
  submittedAt?: number;
  approvedAt?: number;
  rejectionReason?: string;
  disputeReason?: string;
}

export interface Escrow {
  id: string;
  payer: string;
  beneficiary: string;
  token: string;
  totalAmount: string;
  releasedAmount: string;
  status: "pending" | "active" | "completed" | "disputed";
  createdAt: number;
  duration: number;
  milestones: Milestone[];
  projectDescription?: string;
  isOpenJob?: boolean; // true if no freelancer assigned yet
  applications?: Application[];
  applicationCount?: number; // real count from blockchain
  isJobCreator?: boolean; // true if current user is the job creator
  isClient?: boolean; // true if current user is the client (payer)
  isFreelancer?: boolean; // true if current user is the freelancer (beneficiary)
  milestoneCount?: number; // total number of milestones for this escrow
}

export interface EscrowStats {
  activeEscrows: number;
  totalVolume: string;
  completedEscrows: number;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  balance: string;
}

export interface Application {
  freelancerAddress: string;
  coverLetter: string;
  proposedTimeline: number;
  appliedAt: number;
  status: "pending" | "accepted" | "rejected";
}
