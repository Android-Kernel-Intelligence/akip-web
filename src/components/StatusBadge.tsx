import React from "react";
import type { BuildStatus } from "../lib/types";
import { Clock, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: BuildStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    QUEUED: {
      bg: "bg-zinc-900/60 border-zinc-800 text-zinc-400",
      icon: <Clock className="h-3.5 w-3.5" />,
      text: "Queued"
    },
    RUNNING: {
      bg: "bg-cyan-950/40 border-cyan-800/60 text-cyan-400",
      icon: <RefreshCw className="h-3.5 w-3.5 animate-spin" />,
      text: "Patching & Compiling"
    },
    SUCCESS: {
      bg: "bg-emerald-950/40 border-emerald-800/60 text-emerald-400",
      icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />,
      text: "Completed"
    },
    FAILED: {
      bg: "bg-rose-950/40 border-rose-800/60 text-rose-400",
      icon: <XCircle className="h-3.5 w-3.5 text-rose-400" />,
      text: "Failed"
    },
    CANCELLED: {
      bg: "bg-amber-950/40 border-amber-800/60 text-amber-400",
      icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
      text: "Cancelled"
    }
  };

  const active = config[status] || config.QUEUED;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${active.bg}`}>
      {active.icon}
      <span>{active.text}</span>
    </span>
  );
};
