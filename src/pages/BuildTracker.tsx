import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getBuildStatus } from "../lib/api";
import type { StatusResponse } from "../lib/types";
import { StatusBadge } from "../components/StatusBadge";
import { PipelineStep } from "../components/PipelineStep";
import { Terminal, Copy, Check, Sparkles, ArrowRight, RefreshCw, FileText } from "lucide-react";

export const BuildTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [buildData, setBuildData] = useState<StatusResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Poll status endpoint every 2s for realtime log streaming
  useEffect(() => {
    if (!id) return;

    const fetchStatus = async () => {
      try {
        const data = await getBuildStatus(id);
        setBuildData(data);
        
        // Append only new log lines (don't re-render everything)
        if (data.logs && data.logs.length > 0) {
          setLogLines(prev => {
            const newLines = data.logs!.slice(prev.length);
            if (newLines.length > 0) {
              return [...prev, ...newLines];
            }
            return prev;
          });
        }
        
        // Stop polling on terminal states
        if (data.status === "SUCCESS" || data.status === "FAILED" || data.status === "CANCELLED") {
          clearInterval(pollTimer);
        }
      } catch (err) {
        console.error("Status check failed", err);
      }
    };

    fetchStatus();
    const pollTimer = setInterval(fetchStatus, 2000); // 2s for near-realtime

    return () => clearInterval(pollTimer);
  }, [id]);

  // Auto-scroll to bottom when new log lines arrive
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logLines.length]);

  const handleCopyId = async () => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!buildData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="text-sm text-zinc-400 font-semibold tracking-wide">Syncing build pipeline status...</span>
        </div>
      </div>
    );
  }

  // Calculate Pipeline Step states based on status/progress
  const getStepState = (stepIndex: number) => {
    const { status, progress_percent = 0 } = buildData;
    
    if (status === "FAILED") {
      // Determine which step failed based on progress
      if (progress_percent < 20 && stepIndex === 1) return "failed";
      if (progress_percent >= 20 && progress_percent < 45 && stepIndex === 2) return "failed";
      if (progress_percent >= 45 && progress_percent < 75 && stepIndex === 3) return "failed";
      if (progress_percent >= 75 && progress_percent < 90 && stepIndex === 4) return "failed";
      if (progress_percent >= 90 && progress_percent < 100 && stepIndex === 5) return "failed";
    }

    if (status === "SUCCESS") return "completed";

    // Progressive thresholds
    if (stepIndex === 1) { // Queued
      return progress_percent >= 5 ? (progress_percent > 5 ? "completed" : "active") : "pending";
    }
    if (stepIndex === 2) { // Fetching Source
      return progress_percent >= 20 ? (progress_percent > 20 ? "completed" : "active") : "pending";
    }
    if (stepIndex === 3) { // Patching Source
      return progress_percent >= 45 ? (progress_percent > 45 ? "completed" : "active") : "pending";
    }
    if (stepIndex === 4) { // Compiling
      return progress_percent >= 75 ? (progress_percent > 75 ? "completed" : "active") : "pending";
    }
    if (stepIndex === 5) { // Packaging
      return progress_percent >= 90 ? (progress_percent > 90 ? "completed" : "active") : "pending";
    }
    if (stepIndex === 6) { // Deploying
      return progress_percent >= 100 ? "completed" : "pending";
    }
    return "pending";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
      {/* Build Header Status */}
      <div className="glass p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-zinc-800">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-lg font-bold text-white tracking-tight">Build Job Tracker</span>
            <StatusBadge status={buildData.status} />
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
            <span>ID:</span>
            <span className="text-zinc-400 select-all">{id}</span>
            <button onClick={handleCopyId} className="hover:text-white transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-bold font-mono">
            <span className="text-zinc-400">PIPELINE PROGRESS</span>
            <span className="text-indigo-400">{buildData.progress_percent || 0}%</span>
          </div>
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-3 overflow-hidden p-[2px]">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${buildData.progress_percent || 0}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 font-semibold tracking-wide text-right uppercase">
            {buildData.current_step || "Initializing..."}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Pipeline Tracker Checklist */}
        <div className="glass p-6 sm:p-8 rounded-2xl space-y-6 lg:col-span-1 border border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-200">Pipeline Stages</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Real-time compilation workflow trace.</p>
          </div>

          <div className="pt-2">
            <PipelineStep
              label="Queued"
              description="GitHub runner allocation and setup"
              state={getStepState(1)}
            />
            <PipelineStep
              label="Fetching Source"
              description="Cloning target kernel repository"
              state={getStepState(2)}
            />
            <PipelineStep
              label="Patching Engine"
              description="Applying selected plugin overlays"
              state={getStepState(3)}
            />
            <PipelineStep
              label="Compiling GKI"
              description="LLVM/Clang kernel building compilation"
              state={getStepState(4)}
            />
            <PipelineStep
              label="Packaging"
              description="Flashable zip generation via AnyKernel3"
              state={getStepState(5)}
            />
            <PipelineStep
              label="Artifact Storage"
              description="Build upload & manifest synchronization"
              state={getStepState(6)}
            />
          </div>
        </div>

        {/* Right Side: Log Console Terminal */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="flex-1 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl overflow-hidden min-h-[380px]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-5 py-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-zinc-650">|</span>
                <div className="flex items-center space-x-1.5 text-zinc-400">
                  <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-[11px] font-bold font-mono tracking-wider">COMPILER_STDOUT</span>
                </div>
              </div>
              
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-500 animate-pulse">
                {logLines.length > 0 ? `${logLines.length} LINES` : "LIVE"}
              </span>
            </div>

            {/* Terminal Console — append-only realtime log stream */}
            <div ref={logContainerRef} className="flex-1 p-5 overflow-y-auto font-mono text-xs text-zinc-300 space-y-1.5 bg-zinc-950/40 custom-scrollbar max-h-[360px]">
              {logLines.length > 0 ? (
                logLines.map((logLine, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed flex items-start gap-2 ${
                      logLine.includes("SUCCESS")
                        ? "text-emerald-400 font-semibold"
                        : logLine.includes("ERROR") || logLine.includes("failed") || logLine.includes("FAILED")
                        ? "text-rose-400 font-semibold"
                        : logLine.includes("WARNING")
                        ? "text-amber-400"
                        : logLine.startsWith("[CC]")
                        ? "text-zinc-500 text-[10px]"
                        : "text-zinc-300"
                    }`}
                  >
                    <span className="text-zinc-700 select-none shrink-0 tabular-nums">{String(idx + 1).padStart(3, "0")}</span>
                    <span>{logLine}</span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 italic flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Waiting for runner to start logging...
                </div>
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>

          {/* Action Footer conditional routing */}
          {buildData.status === "SUCCESS" && (
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-indigo-950/10 border border-indigo-500/20 p-5 rounded-2xl animate-pulse">
              <div className="flex items-center space-x-3 text-left">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Your build is complete & boots!</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Please provide feedback and download the manifest to verify.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/build/${id}/community`}
                  className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition-all shadow-md shadow-indigo-600/10"
                >
                  <span>Did it boot?</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                
                <Link
                  to={`/build/${id}/manifest`}
                  className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-bold text-xs text-zinc-200 transition-all"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Reproducibility Manifest</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
