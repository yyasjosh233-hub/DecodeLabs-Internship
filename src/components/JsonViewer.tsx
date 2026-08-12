import React, { useState } from 'react';
import { Code2, Copy, Check, Download, BookmarkCheck } from 'lucide-react';
import type { ExtractedData } from '../types/schema';

interface JsonViewerProps {
  data: ExtractedData;
}

const ALL_SCHEMA_KEYS: (keyof ExtractedData)[] = [
  'customer_name',
  'email',
  'phone',
  'company',
  'order_number',
  'product',
  'city',
  'state',
  'country',
  'purchase_date',
  'delivery_date',
  'status',
  'amount',
  'currency'
];

export const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const formattedJson = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-full bg-[#0d101d]/90 border-[#1c233c] rounded-2xl">
      
      {/* Top Bar Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">JSON Output</h2>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-[#161c2e] hover:bg-[#1f2740] border border-white/10 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-[#161c2e] hover:bg-[#1f2740] border border-white/10 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Download JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-[#161c2e] hover:bg-[#1f2740] border border-white/10 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Save to History"
          >
            <BookmarkCheck className={`w-3.5 h-3.5 ${saved ? 'text-emerald-400' : 'text-gray-400'}`} />
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* JSON Code Viewer Container */}
      <div className="flex-1 min-h-[300px] rounded-xl bg-[#060812] border border-white/10 p-4 font-mono text-xs overflow-auto leading-relaxed">
        <pre className="text-gray-300">
          {formattedJson.split('\n').map((line, idx) => (
            <div key={idx} className="hover:bg-white/[0.02] px-1 rounded flex">
              <span className="flex-1 whitespace-pre-wrap">{colorizeJsonLine(line)}</span>
            </div>
          ))}
        </pre>
      </div>

      {/* FIELD EXTRACTION SUMMARY Section */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <h3 className="text-[10px] font-mono font-semibold tracking-wider text-gray-400 uppercase mb-3">
          FIELD EXTRACTION SUMMARY
        </h3>

        {/* 14 Schema Field Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
          {ALL_SCHEMA_KEYS.map((key) => {
            const isMatched = data[key] !== null && data[key] !== undefined;

            return (
              <div
                key={key}
                className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                  isMatched
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 font-medium'
                    : 'bg-[#0a0e19] border-white/5 text-gray-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isMatched ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-gray-700'}`} />
                <span className="truncate">{key}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// Syntax highlighter helper
function colorizeJsonLine(line: string) {
  const nullRegex = /:\s*null/g;
  const stringRegex = /:\s*"([^"]*)"/g;

  if (nullRegex.test(line)) {
    return (
      <span dangerouslySetInnerHTML={{
        __html: line
          .replace(/"([^"]+)":/g, '<span class="text-cyan-300">"$1"</span>:')
          .replace(/:\s*null/g, ': <span class="text-gray-500 italic">null</span>')
      }} />
    );
  }

  if (stringRegex.test(line)) {
    return (
      <span dangerouslySetInnerHTML={{
        __html: line
          .replace(/"([^"]+)":/g, '<span class="text-cyan-300">"$1"</span>:')
          .replace(/:\s*"([^"]*)"/g, ': <span class="text-emerald-400">"$1"</span>')
      }} />
    );
  }

  return <span className="text-gray-400">{line}</span>;
}

