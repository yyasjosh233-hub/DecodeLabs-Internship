import React, { useState } from 'react';
import { FileText, Download, Trash2, Zap, ChevronDown } from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samples';
import type { PresetSample } from '../types/schema';

interface RawInputPanelProps {
  rawText: string;
  setRawText: (text: string) => void;
  activePresetId: string | null;
  onSelectPreset: (preset: PresetSample) => void;
  onTriggerExtract?: () => void;
}

export const RawInputPanel: React.FC<RawInputPanelProps> = ({
  rawText,
  setRawText,
  activePresetId,
  onSelectPreset,
  onTriggerExtract,
}) => {
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);
  const charCount = rawText.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onTriggerExtract) onTriggerExtract();
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-full bg-[#0d101d]/90 border-[#1c233c] rounded-2xl">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Raw Input</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Sample Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowSampleDropdown(!showSampleDropdown)}
              className="px-3 py-1.5 rounded-lg bg-[#161c2e] hover:bg-[#1f2740] border border-white/10 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Sample
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showSampleDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#141a2c] border border-white/15 shadow-2xl z-50 py-1.5 animate-fade-in">
                <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-gray-400 border-b border-white/5 mb-1">
                  Load Preset Sample
                </div>
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setShowSampleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-violet-600/20 hover:text-white flex flex-col gap-0.5 transition-colors ${
                      activePresetId === preset.id ? 'bg-violet-600/30 text-violet-300 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    <span>{preset.title}</span>
                    <span className="text-[10px] text-gray-500 line-clamp-1">{preset.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Button */}
          <button
            onClick={() => setRawText('')}
            className="px-3 py-1.5 rounded-lg bg-[#161c2e] hover:bg-rose-500/10 hover:text-rose-400 border border-white/10 text-gray-400 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Clear Raw Text Input"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Input Textarea Container */}
      <div className="relative flex-1 min-h-[340px] flex flex-col rounded-xl bg-[#080b15] border border-white/10 focus-within:border-violet-500/60 transition-all">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste unstructured raw text here (e.g. customer order, email, invoice)..."
          className="w-full flex-1 p-4 bg-transparent text-gray-100 font-mono text-xs leading-relaxed focus:outline-none resize-none"
        />

        {/* Textarea Bottom Footer Info */}
        <div className="px-4 py-2 bg-[#060810]/70 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500 select-none">
          <span>{charCount} chars</span>
          <span className="text-gray-600">•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400">Ctrl+Enter</kbd> to extract</span>
        </div>
      </div>

      {/* Action Extract Button */}
      <div className="mt-4">
        <button
          onClick={onTriggerExtract}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
        >
          <Zap className="w-4 h-4 fill-current text-amber-300 animate-pulse" />
          Extract JSON
        </button>
      </div>

    </div>
  );
};

