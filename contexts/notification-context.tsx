"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useWeb3 } from "./web3-context";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  type: "milestone" | "dispute" | "escrow" | "application";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
    targetAddresses?: string[],
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
  addCrossWalletNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
    clientAddress?: string,
    freelancerAddress?: string,
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount and when wallet changes
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      const saved = localStorage.getItem(`notifications_${wallet.address}`);
      if (saved) {
        const parsedNotifications = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const notificationsWithDates = parsedNotifications.map(
          (notif: any) => ({
            ...notif,
            timestamp: new Date(notif.timestamp),
          }),
        );
        setNotifications(notificationsWithDates);
      } else {
        // If no saved notifications, start with empty array
        setNotifications([]);
      }
    } else {
      // If wallet not connected, clear notifications
      setNotifications([]);
    }
  }, [wallet.isConnected, wallet.address]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      localStorage.setItem(
        `notifications_${wallet.address}`,
        JSON.stringify(notifications),
      );
    }
  }, [notifications, wallet.isConnected, wallet.address]);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
    targetAddresses?: string[], // Optional: specific addresses to notify
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Always add to current user's notifications
    setNotifications((prev) => [newNotification, ...prev]);

    // If target addresses are specified, also store for those addresses (cross-wallet notifications)
    if (targetAddresses && targetAddresses.length > 0) {
      targetAddresses.forEach((address) => {
        if (address && address !== wallet.address) {
          const existingNotifications = JSON.parse(
            localStorage.getItem(`notifications_${address}`) || "[]",
          );
          const updatedNotifications = [
            newNotification,
            ...existingNotifications,
          ];
          localStorage.setItem(
            `notifications_${address}`,
            JSON.stringify(updatedNotifications),
          );
        }
      });
    }

    // Show toast for important notifications
    if (notification.type === "milestone" || notification.type === "dispute") {
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const addCrossWalletNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
    clientAddress?: string,
    freelancerAddress?: string,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Always add to current user's notifications
    setNotifications((prev) => [newNotification, ...prev]);

    // Collect all target addresses (both client and freelancer)
    const targetAddresses = [];
    if (
      clientAddress &&
      clientAddress.toLowerCase() !== wallet.address?.toLowerCase()
    ) {
      targetAddresses.push(clientAddress.toLowerCase());
    }
    if (
      freelancerAddress &&
      freelancerAddress.toLowerCase() !== wallet.address?.toLowerCase()
    ) {
      targetAddresses.push(freelancerAddress.toLowerCase());
    }

    // Send to all target addresses
    targetAddresses.forEach((address) => {
      const existingNotifications = JSON.parse(
        localStorage.getItem(`notifications_${address}`) || "[]",
      );
      const updatedNotifications = [newNotification, ...existingNotifications];
      localStorage.setItem(
        `notifications_${address}`,
        JSON.stringify(updatedNotifications),
      );
    });

    // Show toast for important notifications
    if (notification.type === "milestone" || notification.type === "dispute") {
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        removeNotification,
        addCrossWalletNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}

// Helper functions for common notification types
export const createMilestoneNotification = (
  action: "submitted" | "approved" | "rejected" | "disputed",
  escrowId: string,
  milestoneIndex: number,
  additionalData?: Record<string, any>,
): Omit<Notification, "id" | "timestamp" | "read"> => {
  const baseData = {
    escrowId,
    milestoneIndex,
    ...additionalData,
  };

  switch (action) {
    case "submitted":
      return {
        type: "milestone",
        title: "New Milestone Submitted",
        message: `Milestone ${milestoneIndex + 1} has been submitted for review`,
        actionUrl: `/dashboard?escrow=${escrowId}`,
        data: baseData,
      };
    case "approved":
      return {
        type: "milestone",
        title: "Milestone Approved!",
        message: `Milestone ${milestoneIndex + 1} has been approved and payment released`,
        actionUrl: `/freelancer?escrow=${escrowId}`,
        data: baseData,
      };
    case "rejected":
      return {
        type: "milestone",
        title: "Milestone Rejected",
        message: `Milestone ${milestoneIndex + 1} has been rejected. Please review and resubmit`,
        actionUrl: `/freelancer?escrow=${escrowId}`,
        data: baseData,
      };
    case "disputed":
      return {
        type: "dispute",
        title: "Milestone Disputed",
        message: `Milestone ${milestoneIndex + 1} is under dispute and requires admin review`,
        actionUrl: `/admin?escrow=${escrowId}`,
        data: baseData,
      };
    default:
      return {
        type: "milestone",
        title: "Milestone Update",
        message: `Milestone ${milestoneIndex + 1} status updated`,
        actionUrl: `/dashboard?escrow=${escrowId}`,
        data: baseData,
      };
  }
};

export const createEscrowNotification = (
  action: "created" | "completed" | "refunded" | "work_started",
  escrowId: string,
  additionalData?: Record<string, any>,
): Omit<Notification, "id" | "timestamp" | "read"> => {
  const baseData = {
    escrowId,
    ...additionalData,
  };

  switch (action) {
    case "created":
      return {
        type: "escrow",
        title: "New Escrow Created",
        message: "A new escrow has been created and is ready for work",
        actionUrl: `/dashboard?escrow=${escrowId}`,
        data: baseData,
      };
    case "completed":
      return {
        type: "escrow",
        title: "Escrow Completed!",
        message: "All milestones have been completed and payments released",
        actionUrl: `/dashboard?escrow=${escrowId}`,
        data: baseData,
      };
    case "refunded":
      return {
        type: "escrow",
        title: "Escrow Refunded",
        message: "The escrow has been refunded due to project cancellation",
        actionUrl: `/dashboard?escrow=${escrowId}`,
        data: baseData,
      };
    case "work_started":
      return {
        type: "escrow",
        title: "Work Started!",
        message: `${additionalData?.freelancerName || "Freelancer"} has started work on ${additionalData?.projectTitle || `Project #${escrowId}`}`,
        actionUrl: `/dashboard?escrow=${escrowId}`,
        data: baseData,
      };
    default:
      return {
        type: "escrow",
        title: "Escrow Update",
        message: "Escrow status has been updated",
        actionUrl: `/dashboard?escrow=${escrowId}`,
        data: baseData,
      };
  }
};

export const createApplicationNotification = (
  action: "submitted" | "approved" | "rejected",
  jobId: number,
  freelancerAddress: string,
  additionalData?: Record<string, any>,
): Omit<Notification, "id" | "timestamp" | "read"> => {
  const baseData = {
    jobId,
    freelancerAddress,
    ...additionalData,
  };

  switch (action) {
    case "submitted":
      return {
        type: "application",
        title: "New Job Application",
        message: `Someone applied to your job: ${additionalData?.jobTitle || `Job #${jobId}`}`,
        actionUrl: `/approvals?job=${jobId}`,
        data: baseData,
      };
    case "approved":
      return {
        type: "application",
        title: "Application Approved!",
        message: `Your application for ${additionalData?.jobTitle || `Job #${jobId}`} has been approved`,
        actionUrl: `/freelancer?job=${jobId}`,
        data: baseData,
      };
    case "rejected":
      return {
        type: "application",
        title: "Application Rejected",
        message: `Your application for ${additionalData?.jobTitle || `Job #${jobId}`} was not selected`,
        actionUrl: `/freelancer?job=${jobId}`,
        data: baseData,
      };
    default:
      return {
        type: "application",
        title: "Application Update",
        message: `Application status updated for ${additionalData?.jobTitle || `Job #${jobId}`}`,
        actionUrl: `/approvals?job=${jobId}`,
        data: baseData,
      };
  }
};
