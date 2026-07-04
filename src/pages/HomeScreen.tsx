import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GitPullRequest, ArrowRight, AlertCircle, Info, Cpu } from "lucide-react";
import { analyzeKernel, parseGitHubUrl } from "../lib/api";

export const HomeScreen: React.FC = () => {
  const [gitUrl, setGitUrl] = useState("");
  const [arch, setArch] = useState("arm64");
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLogs([]);

    const parsed = parseGitHubUrl(gitUrl);
    if (!parsed) {
      setError("Please enter a valid GitHub repository URL (e.g., github.com/owner/repo)");
      return;
    }

    setAnalyzing(true);

    const printLogs = async (steps: string[]) => {
      for (const step of steps) {
        setLogs((prev) => [...prev, step]);
        await new Promise((resolve) => setTimeout(resolve, 450));
      }
    };

    try {
      // Start the API call in parallel
      const apiPromise = analyzeKernel(gitUrl, arch, ["plugins/root/kernelsu", "plugins/security/susfs"]);

      // Print initial log steps
      setLogs((prev) => [...prev, `[INFO] Parsing repository URL: github.com/${parsed.owner}/${parsed.repo}`]);
      await new Promise((resolve) => setTimeout(resolve, 450));
      setLogs((prev) => [...prev, "[INFO] Connecting to GitHub REST API..."]);
      await new Promise((resolve) => setTimeout(resolve, 450));
      
      const res = await apiPromise;
      
      // Print the rest of the actual backend logs dynamically!
      const remainingLogs = res.logs ? res.logs.slice(2) : [
        "[INFO] Makefile retrieved successfully.",
        `[INFO] Parsed Kernel Version: ${res.report.kernel_version}`,
        `[SUCCESS] Analysis completed. Final confidence score: ${Math.round(res.report.summary.compatibility_score * 100)}%`
      ];
      
      await printLogs(remainingLogs);

      // Small pause to show success message
      await new Promise((resolve) => setTimeout(resolve, 300));

      navigate(`/analyze/${res.report.cache_key}`, {
        state: {
          report: res.report,
          gitUrl,
          arch
        }
      });
    } catch (err: any) {
      const errorLogs = err.logs ? err.logs.slice(2) : [
        `[ERROR] ${err.message || "Analysis engine connection failed."}`
      ];
      await printLogs(errorLogs);
      setError(err.message || "Analysis failed. Please check repository URL or credentials.");
    }
  };

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] relative px-4">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-2xl z-10 space-y-6">
          <div className="glass p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl space-y-6 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-zinc-500 text-[10px]">AKIP-VERIFY-DAEMON</span>
            </div>

            <div className="space-y-2.5 min-h-[160px] overflow-y-auto max-h-[250px] scrollbar-thin text-zinc-300">
              {logs.map((log, index) => {
                const isError = log.includes("ERROR");
                const isSuccess = log.includes("SUCCESS");
                const colorClass = isError ? "text-rose-400" : isSuccess ? "text-emerald-400" : "text-zinc-300";
                return (
                  <div key={index} className={`flex items-start gap-2 ${colorClass}`}>
                    <span className="text-zinc-600 select-none">$&gt;</span>
                    <span>{log}</span>
                  </div>
                );
              })}
              {logs.length < 7 && !error && (
                <div className="flex items-center space-x-2 text-indigo-400">
                  <span className="text-zinc-600 select-none">$&gt;</span>
                  <span className="h-3 w-1.5 bg-indigo-400 inline-block animate-pulse" />
                  <span>Processing...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAnalyzing(false);
                    setError(null);
                    setLogs([]);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-white font-bold text-xs"
                >
                  Dismiss & Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] relative px-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl text-center z-10 space-y-8 animate-fade-in-up">
        {/* Banner Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
          <GitPullRequest className="h-3.5 w-3.5" />
          <span>Automated Android GKI Patcher v1.0.0</span>
        </div>

        {/* Hero Headers */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
            Compile & Patch Android Kernels{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              In Seconds
            </span>
          </h1>
          <p className="max-w-lg mx-auto text-sm sm:text-base text-zinc-400 font-medium">
            Enter a kernel source Git repository, check plugin compatibility, compile with LLVM/Clang, and deploy reproducible builds.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleAnalyze} className="glass p-6 sm:p-8 rounded-2xl text-left space-y-6">
          <div className="space-y-2">
            <label htmlFor="repo-url" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Kernel Git Repository URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </div>
              <input
                id="repo-url"
                type="text"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                placeholder="https://github.com/kernel/common"
                disabled={analyzing}
                className="w-full pl-11 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            {error && (
              <div className="flex items-center space-x-2 text-rose-400 text-xs mt-1.5 font-medium animate-pulse">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Arch Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Target Architecture
              </span>
              <div className="flex bg-zinc-950/80 border border-zinc-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setArch("arm64")}
                  disabled={analyzing}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    arch === "arm64"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Cpu className="inline-block h-3.5 w-3.5 mr-1" />
                  ARM64 (GKI)
                </button>
                <button
                  type="button"
                  onClick={() => setArch("x86_64")}
                  disabled={analyzing}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    arch === "x86_64"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Cpu className="inline-block h-3.5 w-3.5 mr-1" />
                  x86_64
                </button>
              </div>
            </div>

            {/* Quick Note */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-3 flex items-start space-x-2">
              <Info className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                AKIP automatically verifies compatibility with Android GKI (Generic Kernel Image) and compiles using Clang 17.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={analyzing || !gitUrl.trim()}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed font-bold text-sm text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <>
                <span>Analyze Kernel & Configure</span>
                <ArrowRight className="h-4 w-4" />
              </>
            </button>
            <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
              By initiating analysis, you agree to our EU-compliant terms. The system processes the public GitHub repository manifest and verifies file compatibility in-memory on our secure serverless endpoint.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
