"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ReputationScoreProps {
  address: string;
  completedEscrows: number;
  totalVolume: string;
  className?: string;
  role?: "client" | "freelancer" | "both";
}

export function ReputationScore({
  address,
  completedEscrows,
  totalVolume,
  className,
  role = "both",
}: ReputationScoreProps) {
  const calculateScore = () => {
    // Different reputation calculation based on role
    const volumeInTokens = Number.parseFloat(totalVolume) / 1e18; // Convert from wei to tokens

    if (role === "client") {
      // Client reputation: based on successful payments and volume
      const baseScore = completedEscrows * 15; // Higher weight for client reputation
      const volumeBonus = Math.min(volumeInTokens / 100, 40); // Volume bonus for clients
      return Math.min(Math.round(baseScore + volumeBonus), 100);
    } else if (role === "freelancer") {
      // Freelancer reputation: based on completed work and quality
      const baseScore = completedEscrows * 20; // Even higher weight for freelancer reputation
      const volumeBonus = Math.min(volumeInTokens / 50, 30); // Volume bonus for freelancers
      return Math.min(Math.round(baseScore + volumeBonus), 100);
    } else {
      // Combined reputation (default)
      const baseScore = completedEscrows * 12;
      const volumeBonus = Math.min(volumeInTokens / 200, 25);
      return Math.min(Math.round(baseScore + volumeBonus), 100);
    }
  };

  const getReputationLevel = (score: number) => {
    if (role === "client") {
      if (score >= 90)
        return { label: "Elite Client", color: "text-accent", icon: Award };
      if (score >= 70)
        return { label: "Trusted Client", color: "text-primary", icon: Star };
      if (score >= 50)
        return {
          label: "Reliable Client",
          color: "text-primary",
          icon: TrendingUp,
        };
      if (score >= 30)
        return {
          label: "Established Client",
          color: "text-muted-foreground",
          icon: Star,
        };
      return {
        label: "New Client",
        color: "text-muted-foreground",
        icon: Star,
      };
    } else if (role === "freelancer") {
      if (score >= 90)
        return { label: "Elite Freelancer", color: "text-accent", icon: Award };
      if (score >= 70)
        return {
          label: "Expert Freelancer",
          color: "text-primary",
          icon: Star,
        };
      if (score >= 50)
        return {
          label: "Skilled Freelancer",
          color: "text-primary",
          icon: TrendingUp,
        };
      if (score >= 30)
        return {
          label: "Experienced Freelancer",
          color: "text-muted-foreground",
          icon: Star,
        };
      return {
        label: "New Freelancer",
        color: "text-muted-foreground",
        icon: Star,
      };
    } else {
      if (score >= 90)
        return { label: "Elite", color: "text-accent", icon: Award };
      if (score >= 70)
        return { label: "Expert", color: "text-primary", icon: Star };
      if (score >= 50)
        return { label: "Trusted", color: "text-primary", icon: TrendingUp };
      if (score >= 30)
        return {
          label: "Established",
          color: "text-muted-foreground",
          icon: Star,
        };
      return { label: "Newcomer", color: "text-muted-foreground", icon: Star };
    }
  };

  const score = calculateScore();
  const level = getReputationLevel(score);
  const Icon = level.icon;

  return (
    <Card className={`glass border-primary/20 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Reputation Score</h3>
        <Badge variant="outline" className="gap-1">
          <Icon className="h-3 w-3" />
          {level.label}
        </Badge>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
              className={level.color}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 40 * (1 - score / 100),
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{score}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {role === "client" ? "Projects Funded" : "Projects Completed"}
            </span>
            <span className="font-semibold">{completedEscrows}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {role === "client" ? "Total Spent" : "Total Earned"}
            </span>
            <span className="font-semibold">
              {(Number.parseFloat(totalVolume) / 1e18).toFixed(2)} tokens
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {role === "client" ? "Client Rating" : "Freelancer Rating"}
            </span>
            <span className={`font-semibold ${level.color}`}>
              {level.label}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
