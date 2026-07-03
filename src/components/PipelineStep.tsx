import React from "react";
import { Check, Loader2, Circle, AlertTriangle } from "lucide-react";

interface PipelineStepProps {
  label: string;
  description: string;
  state: "pending" | "active" | "completed" | "failed";
}

export const PipelineStep: React.FC<PipelineStepProps> = ({ label, description, state }) => {
  const getIcon = () => {
    switch (state) {
      case "completed":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400">
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
        );
      case "active":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500 text-indigo-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        );
      case "failed":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500 text-rose-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
            <Circle className="h-3 w-3 fill-zinc-900" />
          </div>
        );
    }
  };

  const getTextColor = () => {
    if (state === "completed") return "text-zinc-200";
    if (state === "active") return "text-indigo-400 font-bold";
    if (state === "failed") return "text-rose-400 font-bold";
    return "text-zinc-500";
  };

  return (
    <div className="relative flex items-start pb-8 last:pb-0">
      {/* Connector Line */}
      <div className="absolute left-[13px] top-7 bottom-0 w-[2px] bg-zinc-800 last:hidden" />

      <div className="flex items-center space-x-4 relative z-10">
        {getIcon()}
        <div className="flex flex-col">
          <span className={`text-sm ${getTextColor()}`}>{label}</span>
          <span className="text-xs text-zinc-500 mt-0.5">{description}</span>
        </div>
      </div>
    </div>
  );
};
