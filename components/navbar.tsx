"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/wallet-button";
import { SmartAccountStatus } from "@/components/smart-account-status";
import { NotificationCenter } from "@/components/notification-center";
import { Shield, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFreelancerStatus } from "@/hooks/use-freelancer-status";
import { useAdminStatus } from "@/hooks/use-admin-status";
import { useJobCreatorStatus } from "@/hooks/use-job-creator-status";
import { usePendingApprovals } from "@/hooks/use-pending-approvals";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { isFreelancer } = useFreelancerStatus();
  const { isAdmin } = useAdminStatus();
  const { isJobCreator } = useJobCreatorStatus();
  const { hasPendingApprovals } = usePendingApprovals();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 glass">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo - Responsive sizing */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl shrink-0">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden xs:inline">
              SecureFlow
            </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent xs:hidden">
              SF
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on sm/md, shown on lg+ */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors px-2 xl:px-3 py-2 rounded-md ${
                isActive("/")
                  ? "text-primary bg-primary/10"
                  : "hover:text-primary"
              }`}
            >
              Home
            </Link>
            <Link
              href="/jobs"
              className={`text-sm font-medium transition-colors px-2 xl:px-3 py-2 rounded-md ${
                isActive("/jobs")
                  ? "text-primary bg-primary/10"
                  : "hover:text-primary"
              }`}
            >
              Browse Jobs
            </Link>
            <Link
              href="/create"
              className={`text-sm font-medium transition-colors px-2 xl:px-3 py-2 rounded-md ${
                isActive("/create")
                  ? "text-primary bg-primary/10"
                  : "hover:text-primary"
              }`}
            >
              Create Escrow
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors px-2 xl:px-3 py-2 rounded-md ${
                isActive("/dashboard")
                  ? "text-primary bg-primary/10"
                  : "hover:text-primary"
              }`}
            >
              Dashboard
            </Link>

            {isJobCreator && hasPendingApprovals && (
              <Link
                href="/approvals"
                className={`text-sm font-medium transition-colors px-2 xl:px-3 py-2 rounded-md ${
                  isActive("/approvals")
                    ? "text-primary bg-primary/10"
                    : "hover:text-primary"
                }`}
              >
                Approvals
              </Link>
            )}
            {isFreelancer && (
              <Link
                href="/freelancer"
                className={`text-sm font-medium transition-colors px-2 xl:px-3 py-2 rounded-md ${
                  isActive("/freelancer")
                    ? "text-primary bg-primary/10"
                    : "hover:text-primary"
                }`}
              >
                Freelancer
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors px-2 xl:px-3 py-2 rounded-md ${
                  isActive("/admin")
                    ? "text-primary bg-primary/10"
                    : "hover:text-primary"
                }`}
              >
                Admin
              </Link>
            )}
            <Link
              href="/smart-account-demo"
              className={`text-sm font-medium transition-colors px-2 xl:px-3 py-2 rounded-md whitespace-nowrap ${
                isActive("/smart-account-demo")
                  ? "text-primary bg-primary/10"
                  : "hover:text-primary"
              }`}
            >
              Smart Account
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            {/* Show only essential items on mobile */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <div className="hidden lg:block">
              <SmartAccountStatus />
            </div>
            <div className="shrink-0">
              <NotificationCenter />
            </div>
            <div className="shrink-0 hidden sm:block">
              <WalletButton />
            </div>

            {/* Mobile menu button */}
            <Button
              aria-label="Toggle menu"
              variant="ghost"
              size="icon"
              className="lg:hidden ml-1 h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg"
            >
              <div className="container mx-auto px-3 sm:px-4 py-4 flex flex-col gap-2 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Mobile-only wallet button */}
                <div className="sm:hidden pb-3 border-b border-border/40 mb-2">
                  <WalletButton />
                </div>

                {/* Navigation links */}
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors px-3 py-2.5 rounded-md ${
                    isActive("/")
                      ? "text-primary bg-primary/10"
                      : "hover:text-primary hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/jobs"
                  className={`text-sm font-medium transition-colors px-3 py-2.5 rounded-md ${
                    isActive("/jobs")
                      ? "text-primary bg-primary/10"
                      : "hover:text-primary hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/create"
                  className={`text-sm font-medium transition-colors px-3 py-2.5 rounded-md ${
                    isActive("/create")
                      ? "text-primary bg-primary/10"
                      : "hover:text-primary hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Escrow
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors px-3 py-2.5 rounded-md ${
                    isActive("/dashboard")
                      ? "text-primary bg-primary/10"
                      : "hover:text-primary hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isJobCreator && hasPendingApprovals && (
                  <Link
                    href="/approvals"
                    className={`text-sm font-medium transition-colors px-3 py-2.5 rounded-md ${
                      isActive("/approvals")
                        ? "text-primary bg-primary/10"
                        : "hover:text-primary hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Approvals
                  </Link>
                )}
                {isFreelancer && (
                  <Link
                    href="/freelancer"
                    className={`text-sm font-medium transition-colors px-3 py-2.5 rounded-md ${
                      isActive("/freelancer")
                        ? "text-primary bg-primary/10"
                        : "hover:text-primary hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Freelancer
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium transition-colors px-3 py-2.5 rounded-md ${
                      isActive("/admin")
                        ? "text-primary bg-primary/10"
                        : "hover:text-primary hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/smart-account-demo"
                  className={`text-sm font-medium transition-colors px-3 py-2.5 rounded-md ${
                    isActive("/smart-account-demo")
                      ? "text-primary bg-primary/10"
                      : "hover:text-primary hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Smart Account Demo
                </Link>

                {/* Additional mobile widgets */}
                <div className="flex items-center gap-3 pt-3 mt-2 border-t border-border/40">
                  <div className="sm:hidden">
                    <ThemeToggle />
                  </div>
                  <div className="lg:hidden">
                    <SmartAccountStatus />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
