import React from "react";
import type { KernelPlugin } from "../lib/plugins";
import { Check, ShieldCheck, Cpu, HardDrive, Network, UserCheck } from "lucide-react";

interface PluginCardProps {
  plugin: KernelPlugin;
  isSelected: boolean;
  onToggle: () => void;
}

export const PluginCard: React.FC<PluginCardProps> = ({ plugin, isSelected, onToggle }) => {
  const getIcon = () => {
    switch (plugin.category) {
      case "root":
        return <UserCheck className="h-5 w-5 text-indigo-400" />;
      case "security":
        return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
      case "performance":
        return <Cpu className="h-5 w-5 text-amber-400" />;
      case "network":
        return <Network className="h-5 w-5 text-cyan-400" />;
      default:
        return <HardDrive className="h-5 w-5 text-zinc-400" />;
    }
  };

  return (
    <div
      onClick={onToggle}
      className={`relative flex flex-col justify-between p-5 rounded-xl cursor-pointer select-none transition-all duration-200 border ${
        isSelected
          ? "bg-indigo-950/20 border-indigo-500/50 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]"
          : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
              {getIcon()}
            </div>
            <h3 className="font-semibold text-sm text-zinc-100">{plugin.name}</h3>
          </div>
          {plugin.recommended && (
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Recommended
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">{plugin.description}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
        <span className="text-[10px] font-mono text-zinc-500">{plugin.path}</span>
        
        {/* Customized Switch */}
        <div className="flex items-center">
          <div
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
              isSelected ? "bg-indigo-600" : "bg-zinc-800"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 flex items-center justify-center ${
                isSelected ? "transform translate-x-4" : ""
              }`}
            >
              {isSelected && <Check className="h-3 w-3 text-indigo-600 stroke-[3]" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
