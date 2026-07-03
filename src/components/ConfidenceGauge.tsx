import React, { useEffect, useState } from "react";

interface ConfidenceGaugeProps {
  score: number; // 0.0 - 1.0
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ score }) => {
  const percentage = Math.round(score * 100);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 150);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  let colorClass = "stroke-rose-500";
  let textClass = "text-rose-400";
  let rating = "Critical Risk";

  if (percentage >= 90) {
    colorClass = "stroke-emerald-500";
    textClass = "text-emerald-400";
    rating = "Highly Stable";
  } else if (percentage >= 75) {
    colorClass = "stroke-cyan-500";
    textClass = "text-cyan-400";
    rating = "Compatible";
  } else if (percentage >= 60) {
    colorClass = "stroke-amber-500";
    textClass = "text-amber-400";
    rating = "Medium Risk";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass bg-zinc-950/40">
      <div className="relative h-36 w-36">
        {/* SVG Gauge */}
        <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
          {/* Base track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="stroke-zinc-800 fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Active arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Core Value Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{animatedValue}%</span>
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Confidence</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className={`text-xs font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 ${textClass}`}>
          {rating}
        </span>
      </div>
    </div>
  );
};
