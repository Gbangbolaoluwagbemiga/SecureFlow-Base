"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Manage your escrows and track your projects
        </p>
      </div>
    </motion.div>
  );
}
