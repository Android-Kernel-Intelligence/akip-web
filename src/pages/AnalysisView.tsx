import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ConfidenceGauge } from "../components/ConfidenceGauge";
import { PluginCard } from "../components/PluginCard";
import { AVAILABLE_PLUGINS } from "../lib/plugins";
import { analyzeKernel, triggerBuild } from "../lib/api";
import type { AnalysisReport } from "../lib/types";
import { GitFork, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2, Sliders, Play } from "lucide-react";

export const AnalysisView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Load from Router State or fallback
  const [report, setReport] = useState<AnalysisReport | null>(location.state?.report || null);
  const gitUrl = location.state?.gitUrl || "https://github.com/kernel/common";
  const arch = location.state?.arch || "arm64";
  
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(
    location.state?.report?.plugin_paths || ["plugins/root/kernelsu", "plugins/security/susfs"]
  );
  
  const [stopOnFailure, setStopOnFailure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch report if loaded directly (e.g. via deep link or page refresh)
  useEffect(() => {
    if (!report && !error && id) {
      const fetchReport = async () => {
        try {
          const res = await analyzeKernel(gitUrl, arch, selectedPlugins);
          setReport(res.report);
        } catch (err) {
          setError("Failed to load compatibility report.");
        }
      };
      fetchReport();
    }
  }, [id, report, error]);

  // Re-run compatibility calculations when plugins selection changes
  const handlePluginToggle = async (pluginPath: string) => {
    let nextPlugins = [...selectedPlugins];
    if (nextPlugins.includes(pluginPath)) {
      nextPlugins = nextPlugins.filter((p) => p !== pluginPath);
    } else {
      // Ensure mutual exclusivity for "root" category plugins (KSU, KSU-Next, SukiSu-Ultra)
      const clickedPlugin = AVAILABLE_PLUGINS.find(p => p.path === pluginPath);
      if (clickedPlugin && clickedPlugin.category === "root") {
        const otherRootPaths = AVAILABLE_PLUGINS.filter(p => p.category === "root" && p.path !== pluginPath).map(p => p.path);
        nextPlugins = nextPlugins.filter(p => !otherRootPaths.includes(p));
      }
      nextPlugins.push(pluginPath);
    }
    setSelectedPlugins(nextPlugins);

    setReanalyzing(true);
    try {
      const res = await analyzeKernel(gitUrl, arch, nextPlugins);
      setReport(res.report);
    } catch (err) {
      console.error("Re-analysis failed", err);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleStartBuild = async () => {
    if (!report) return;
    setLoading(true);
    setError(null);
    try {
      const res = await triggerBuild(gitUrl, report.kernel_version, arch, selectedPlugins);
      // Navigate to tracking page
      navigate(`/build/${res.build_id}`);
    } catch (err) {
      setError("Failed to queue the build job on GitHub Actions.");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="glass p-8 rounded-2xl max-w-md text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Error loading report</h2>
          <p className="text-sm text-zinc-400">{error}</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm text-white font-bold">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-zinc-400 font-semibold tracking-wide">Compiling report data...</span>
        </div>
      </div>
    );
  }

  const summary = report.summary || {
    total_rules: 0,
    applicable_rules: 0,
    estimated_patch_sites: 0,
    compatibility_score: 0,
    warnings: [],
    plugins_loaded: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitFork className="h-6 w-6 text-indigo-400" />
            <span>Compatibility Analysis Report</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1 select-all">{gitUrl}</p>
        </div>
        <div className="flex items-center space-x-3 text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2 font-mono">
          <span className="text-zinc-500">ARCH:</span>
          <span className="text-indigo-400 font-bold">{arch.toUpperCase()}</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-500">BASE:</span>
          <span className="text-cyan-400 font-bold">Linux {report.kernel_version}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Score card & warnings */}
        <div className="space-y-6 lg:col-span-1">
          <div className="relative">
            {reanalyzing && (
              <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
            <ConfidenceGauge score={summary.compatibility_score} />
          </div>

          {/* Rules Matcher Stats */}
          <div className="glass p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Patch Summary Stats</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3">
                <span className="text-2xl font-extrabold text-indigo-400">{summary.applicable_rules}</span>
                <span className="block text-[9px] text-zinc-500 font-semibold uppercase mt-0.5">Matched Rules</span>
              </div>
              <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3">
                <span className="text-2xl font-extrabold text-cyan-400">{summary.estimated_patch_sites}</span>
                <span className="block text-[9px] text-zinc-500 font-semibold uppercase mt-0.5">Target Offsets</span>
              </div>
            </div>
          </div>

          {/* Warnings List */}
          {summary.warnings.length > 0 ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="h-4.5 w-4.5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Patching Warnings ({summary.warnings.length})</h4>
              </div>
              <ul className="space-y-2">
                {summary.warnings.map((w, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 pl-4 relative before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Zero Warnings</h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  All patches cleanly match target kernel structures. High probability of stable compilation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Plugin configuration & checklist */}
        <div className="space-y-6 lg:col-span-2">
          {/* Plugin Selection Checklist */}
          <div className="glass p-6 sm:p-8 rounded-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Kernel Plugins Checklist</h2>
              <p className="text-xs text-zinc-400 mt-1">Select the patches you wish to overlay on top of your kernel source tree.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_PLUGINS.map((plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  isSelected={selectedPlugins.includes(plugin.path)}
                  onToggle={() => handlePluginToggle(plugin.path)}
                />
              ))}
            </div>
          </div>

          {/* Compilation options & build trigger */}
          <div className="glass p-6 sm:p-8 rounded-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Build Configuration</h2>
              <p className="text-xs text-zinc-400 mt-1">Fine-tune the patching behavior during GitHub Actions compilation.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/20 cursor-pointer select-none">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-semibold text-zinc-200">Stop on First Failure</span>
                  <span className="text-xs text-zinc-500">Terminate compilation immediately if a patch fails to apply cleanly.</span>
                </div>
                <input
                  type="checkbox"
                  checked={stopOnFailure}
                  onChange={(e) => setStopOnFailure(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-600"
                />
              </label>

              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/20">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-semibold text-zinc-200">Enabled Target Tags</span>
                  <span className="text-xs text-zinc-500">Labels to sign compilation logs and manifest.</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">default</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">reproducible</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStartBuild}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed font-bold text-sm text-white shadow-lg shadow-emerald-950/30 hover:shadow-emerald-500/20 transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Deploying Build to GitHub Actions...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4.5 w-4.5 fill-current" />
                    <span>Trigger Compiler Build Pipeline</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
