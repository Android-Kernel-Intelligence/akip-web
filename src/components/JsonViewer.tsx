import React, { useState } from "react";
import { Copy, Check, Download, FileJson } from "lucide-react";

interface JsonViewerProps {
  data: any;
  filename?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, filename = "manifest.json" }) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simple clean syntax coloring helper
  const renderHighlightedJson = () => {
    return jsonString.split("\n").map((line, idx) => {
      // Find keys, strings, numbers, booleans
      const keyRegex = /^(\s*)"([^"]+)":/;
      const stringValRegex = /: "([^"]+)"(,?)$/;
      const numOrBoolRegex = /: (true|false|\d+)(,?)$/;

      if (keyRegex.test(line)) {
        const match = line.match(keyRegex);
        const indent = match ? match[1] : "";
        const key = match ? match[2] : "";
        const rest = line.substring((match ? match[0].length : 0));

        // Color string values or primitive values in the rest of the line
        let coloredRest = rest;
        if (stringValRegex.test(rest)) {
          coloredRest = rest.replace(stringValRegex, ': <span class="text-cyan-400">"$1"</span>$2');
        } else if (numOrBoolRegex.test(rest)) {
          coloredRest = rest.replace(numOrBoolRegex, ': <span class="text-amber-400">$1</span>$2');
        }

        return (
          <div key={idx} className="font-mono text-xs leading-relaxed">
            {indent}
            <span className="text-indigo-400">"{key}"</span>
            <span dangerouslySetInnerHTML={{ __html: coloredRest }} />
          </div>
        );
      }

      return (
        <div key={idx} className="font-mono text-xs text-zinc-400 leading-relaxed">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
      {/* Control bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
        <div className="flex items-center space-x-2 text-zinc-400">
          <FileJson className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold tracking-wide font-mono">{filename}</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-semibold text-zinc-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-[11px] font-semibold text-white transition-colors"
          >
            <Download className="h-3 w-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Block */}
      <div className="p-4 max-h-[480px] overflow-y-auto bg-zinc-950/60 custom-scrollbar">
        <pre className="font-mono text-xs">{renderHighlightedJson()}</pre>
      </div>
    </div>
  );
};
