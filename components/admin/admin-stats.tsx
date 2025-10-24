"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, DollarSign, Users } from "lucide-react";

interface AdminStatsProps {
  stats: {
    platformFeeBP: number;
    totalEscrows: number;
    totalVolume: string;
    authorizedArbiters: number;
    whitelistedTokens: number;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <Card className="glass border-primary/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Escrows</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEscrows}</div>
          <p className="text-xs text-muted-foreground">Active contracts</p>
        </CardContent>
      </Card>

      <Card className="glass border-accent/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVolume} tokens</div>
          <p className="text-xs text-muted-foreground">Platform volume</p>
        </CardContent>
      </Card>

      <Card className="glass border-primary/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platform Fee</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.platformFeeBP / 100}%</div>
          <p className="text-xs text-muted-foreground">Basis points</p>
        </CardContent>
      </Card>

      <Card className="glass border-primary/20 p-4 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Arbiters</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.authorizedArbiters}</div>
          <p className="text-xs text-muted-foreground">Authorized</p>
        </CardContent>
      </Card>
    </div>
  );
}
