"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

export function FreelancerHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Freelancer Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">
          Manage your freelance projects and track your earnings
        </p>
      </div>
    </motion.div>
  );
}
