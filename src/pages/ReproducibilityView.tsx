import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBuildManifest } from "../lib/api";
import { JsonViewer } from "../components/JsonViewer";
import { FileCode, Settings, Cpu, Compass, ArrowLeft } from "lucide-react";

export const ReproducibilityView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [manifest, setManifest] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const data = getBuildManifest(id);
      setManifest(data);
    }
  }, [id]);

  if (!manifest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-zinc-500">
        No manifest data found for this build.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div className="space-y-1">
          <Link to={`/build/${id}`} className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-2">
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Tracker</span>
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCode className="h-6 w-6 text-indigo-400" />
            <span>Reproducibility Manifest</span>
          </h1>
          <p className="text-xs text-zinc-500 font-medium">Verify compile commands, compiler versions, and build signatures.</p>
        </div>
      </div>

      {/* Compiler Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-5 rounded-xl space-y-2.5">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Cpu className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Compiler Toolchain</h3>
          </div>
          <p className="text-xs text-zinc-300 font-mono leading-relaxed">{manifest.reproducibility.compiler}</p>
        </div>

        <div className="glass p-5 rounded-xl space-y-2.5">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Settings className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Kernel Version</h3>
          </div>
          <p className="text-xs text-zinc-300 font-mono leading-relaxed">
            Linux {manifest.kernel_version} ({manifest.arch})
          </p>
        </div>

        <div className="glass p-5 rounded-xl space-y-2.5">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Compass className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">AnyKernel3 SHA-256</h3>
          </div>
          <p className="text-xs text-zinc-300 font-mono select-all truncate">
            {manifest.reproducibility.checksums["AKIP-Kernel-signed.zip"]}
          </p>
        </div>
      </div>

      {/* JSON Viewer */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Reproducibility manifest (manifest.json)</h2>
        <JsonViewer data={manifest} filename={`manifest-${id}.json`} />
      </div>
    </div>
  );
};
