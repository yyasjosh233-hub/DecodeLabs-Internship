import React from 'react';
import { History, Clock, ArrowUpRight, Trash2 } from 'lucide-react';
import type { ExtractedData } from '../types/schema';
import { EnterpriseDataEngine } from '../services/engine';

export interface HistoryItem {
  id: string;
  timestamp: string;
  rawSnippet: string;
  data: ExtractedData;
}

interface HistoryTabProps {
  history: HistoryItem[];
  onLoadHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  onLoadHistoryItem,
  onClearHistory,
}) => {
  return (
    <div className="glass-panel p-6 flex flex-col gap-6 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-violet-400" />
            Extraction Run History
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Log of recent unstructured document extractions performed in this session.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-lg bg-[#161c2e] hover:bg-rose-500/10 hover:text-rose-400 border border-white/10 text-gray-400 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Log
          </button>
        )}
      </div>

      {/* History Item Cards */}
      {history.length === 0 ? (
        <div className="p-12 text-center text-gray-500 font-mono text-xs border border-dashed border-white/10 rounded-xl">
          No extraction runs logged yet. Extract text in Extractor studio to populate session history.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const stats = EnterpriseDataEngine.getExtractionStats(item.data);
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#080b15] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-violet-500/40 transition-all"
              >
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    <span>{item.timestamp}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-emerald-400 font-semibold">{stats.matchedFields}/{stats.totalFields} fields extracted ({stats.completionPercentage}%)</span>
                  </div>
                  <p className="text-xs font-mono text-gray-300 truncate bg-[#0d1222] p-2 rounded-lg border border-white/5">
                    {item.rawSnippet}
                  </p>
                </div>

                <button
                  onClick={() => onLoadHistoryItem(item)}
                  className="px-3.5 py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-medium flex items-center gap-1.5 transition-all self-start md:self-auto shrink-0"
                >
                  Load in Studio
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
