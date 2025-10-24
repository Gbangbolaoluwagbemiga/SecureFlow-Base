"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, RefreshCw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Milestone {
  description: string;
  amount: string;
}

interface AIMilestoneWriterProps {
  onResult: (milestones: Milestone[]) => void;
  onClose: () => void;
  currentMilestoneIndex: number | null;
  existingMilestones: Milestone[];
}

export function AIMilestoneWriter({
  onResult,
  onClose,
  currentMilestoneIndex,
  existingMilestones,
}: AIMilestoneWriterProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Enter a prompt",
        description: "Please describe what you need for this milestone",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation - in production, call an AI API
    setTimeout(() => {
      const mockSuggestions = [
        `Complete ${prompt} with comprehensive documentation and testing. Deliverables include source code, test cases, and deployment guide.`,
        `Develop and implement ${prompt} following best practices. Includes code review, unit tests, and integration with existing systems.`,
        `Design and build ${prompt} with focus on scalability and performance. Deliverables include architecture diagrams, implementation, and performance benchmarks.`,
      ];
      setSuggestions(mockSuggestions);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Milestone description copied successfully",
    });
  };

  const handleSelect = (text: string) => {
    if (currentMilestoneIndex !== null) {
      // Update specific milestone
      const updatedMilestones = [...existingMilestones];
      updatedMilestones[currentMilestoneIndex] = {
        ...updatedMilestones[currentMilestoneIndex],
        description: text,
      };
      onResult(updatedMilestones);
    } else {
      // Add new milestone
      const newMilestone = { description: text, amount: "" };
      onResult([...existingMilestones, newMilestone]);
    }

    toast({
      title: "Milestone updated",
      description: "AI-generated description has been added to your milestone",
    });
  };

  return (
    <Card className="glass border-accent/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold">AI Milestone Writer</h3>
        <Badge variant="outline" className="ml-auto">
          <span className="text-xs">Beta</span>
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="ml-2 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-prompt">Describe your milestone</Label>
          <Textarea
            id="ai-prompt"
            placeholder="e.g., frontend development for user dashboard"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={generateSuggestions}
          disabled={isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Descriptions
            </>
          )}
        </Button>

        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <Label>AI Suggestions</Label>
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 border-muted hover:border-primary/50 transition-colors">
                    <p className="text-sm leading-relaxed mb-3">{suggestion}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSelect(suggestion)}
                        size="sm"
                        variant="default"
                        className="gap-2"
                      >
                        Use This
                      </Button>
                      <Button
                        onClick={() => handleCopy(suggestion)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
