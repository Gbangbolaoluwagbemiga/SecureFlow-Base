"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/wallet-button";
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

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    // Temporarily disabled to test button functionality
    // document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      // document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SecureFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                  : "hover:text-primary"
              }`}
            >
              Home
            </Link>
            <Link
              href="/jobs"
              className={`text-sm font-medium transition-colors ${
                isActive("/jobs")
                  ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                  : "hover:text-primary"
              }`}
            >
              Browse Jobs
            </Link>
            <Link
              href="/create"
              className={`text-sm font-medium transition-colors ${
                isActive("/create")
                  ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                  : "hover:text-primary"
              }`}
            >
              Create Escrow
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                  : "hover:text-primary"
              }`}
            >
              Dashboard
            </Link>

            {isJobCreator && hasPendingApprovals && (
              <Link
                href="/approvals"
                className={`text-sm font-medium transition-colors ${
                  isActive("/approvals")
                    ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                    : "hover:text-primary"
                }`}
              >
                Approvals
              </Link>
            )}
            {isFreelancer && (
              <Link
                href="/freelancer"
                className={`text-sm font-medium transition-colors ${
                  isActive("/freelancer")
                    ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                    : "hover:text-primary"
                }`}
              >
                Freelancer
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors ${
                  isActive("/admin")
                    ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                    : "hover:text-primary"
                }`}
              >
                Admin
              </Link>
            )}
            <Link
              href="/smart-account-demo"
              className={`text-sm font-medium transition-colors ${
                isActive("/smart-account-demo")
                  ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                  : "hover:text-primary"
              }`}
            >
              Smart Account Demo
            </Link>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {/* Hide heavy widgets on mobile to keep hamburger visible */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <div className="shrink-0">
              <NotificationCenter />
            </div>
            <div className="shrink-0">
              <WalletButton />
            </div>

            <Button
              aria-label="Toggle menu"
              variant="ghost"
              size="icon"
              className="md:hidden ml-1 relative z-50"
              onClick={() => {
                if (mobileMenuOpen) {
                  setMobileMenuOpen(false);
                } else {
                  setMobileMenuOpen(true);
                }
              }}
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
              className="md:hidden border-t border-border/40 bg-background"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors py-2 ${
                    isActive("/")
                      ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                      : "hover:text-primary"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/jobs"
                  className={`text-sm font-medium transition-colors py-2 ${
                    isActive("/jobs")
                      ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                      : "hover:text-primary"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/create"
                  className={`text-sm font-medium transition-colors py-2 ${
                    isActive("/create")
                      ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                      : "hover:text-primary"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Escrow
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors py-2 ${
                    isActive("/dashboard")
                      ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                      : "hover:text-primary"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isJobCreator && hasPendingApprovals && (
                  <Link
                    href="/approvals"
                    className={`text-sm font-medium transition-colors py-2 ${
                      isActive("/approvals")
                        ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                        : "hover:text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Approvals
                  </Link>
                )}
                {isFreelancer && (
                  <Link
                    href="/freelancer"
                    className={`text-sm font-medium transition-colors py-2 ${
                      isActive("/freelancer")
                        ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                        : "hover:text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Freelancer
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium transition-colors py-2 ${
                      isActive("/admin")
                        ? "text-primary bg-primary/10 px-3 py-2 rounded-md"
                        : "hover:text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileMenuOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
