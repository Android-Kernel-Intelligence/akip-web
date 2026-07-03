import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Terminal } from "lucide-react";

export const NavBar: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    if (paths.length === 0) return null;

    return (
      <div className="flex items-center space-x-2 text-xs text-zinc-400">
        <span className="text-zinc-600">/</span>
        <Link to="/" className="hover:text-akip-primary transition-colors">home</Link>
        {paths.map((p, i) => {
          const url = `/${paths.slice(0, i + 1).join("/")}`;
          const isLast = i === paths.length - 1;
          const display = p.length > 15 ? `${p.substring(0, 12)}...` : p;

          return (
            <React.Fragment key={url}>
              <span className="text-zinc-600">/</span>
              {isLast ? (
                <span className="text-zinc-200 font-medium">{display}</span>
              ) : (
                <Link to={url} className="hover:text-akip-primary transition-colors">{display}</Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 transition-colors group-hover:border-akip-primary">
              <Terminal className="h-5 w-5 text-akip-primary group-hover:animate-pulse" />
              <div className="absolute inset-0 rounded-lg bg-akip-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                AKIP PLATFORM
              </span>
              <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Kernel Builder Engine</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            {getBreadcrumbs()}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>API Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
