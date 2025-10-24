"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export function AdminHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Manage the SecureFlow contract and monitor system statistics
        </p>
      </div>
    </motion.div>
  );
}
