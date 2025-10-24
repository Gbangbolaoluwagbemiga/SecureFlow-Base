"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pause, Play, AlertTriangle } from "lucide-react";

interface ContractControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onUnpause: () => void;
  isProcessing: boolean;
}

export function ContractControls({
  isPaused,
  onPause,
  onUnpause,
  isProcessing,
}: ContractControlsProps) {
  return (
    <Card className="glass border-primary/20 p-4 md:p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Contract Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Contract Status</p>
              <p className="text-sm text-muted-foreground">
                {isPaused ? "Currently paused" : "Currently active"}
              </p>
            </div>
            <Badge variant={isPaused ? "destructive" : "default"}>
              {isPaused ? "Paused" : "Active"}
            </Badge>
          </div>

          <div className="flex gap-2">
            {isPaused ? (
              <Button
                onClick={onUnpause}
                disabled={isProcessing}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {isProcessing ? "Unpausing..." : "Unpause Contract"}
              </Button>
            ) : (
              <Button
                onClick={onPause}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                {isProcessing ? "Pausing..." : "Pause Contract"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
