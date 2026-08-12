import React, { useState } from 'react';
import { LayoutGrid, Plus, Trash2, Download, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import type { BatchItem } from '../types/schema';
import { EnterpriseDataEngine } from '../services/engine';
import { SAMPLE_PRESETS } from '../data/samples';

const INITIAL_ITEMS: BatchItem[] = SAMPLE_PRESETS.slice(0, 3).map((p, idx) => ({
  id: (idx + 1).toString(),
  filename: `${p.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
  rawText: p.rawText,
  result: null,
  status: 'idle'
}));

export const BatchProcessor: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>(INITIAL_ITEMS);
  const [newText, setNewText] = useState('');
  const [newFilename, setNewFilename] = useState('');

  const handleRunBatch = () => {
    setItems((prev) =>
      prev.map((item) => {
        const res = EnterpriseDataEngine.extract(item.rawText);
        return {
          ...item,
          result: res,
          status: 'done',
          extractedAt: new Date().toLocaleTimeString()
        };
      })
    );
  };

  const handlePreloadAllPresets = () => {
    const presetItems: BatchItem[] = SAMPLE_PRESETS.map((p, idx) => ({
      id: `preset_${Date.now()}_${idx}`,
      filename: `${p.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
      rawText: p.rawText,
      result: null,
      status: 'idle'
    }));
    setItems(presetItems);
  };

  const handleAddItem = () => {
    if (!newText.trim()) return;
    const newItem: BatchItem = {
      id: Date.now().toString(),
      filename: newFilename.trim() || `Document_${items.length + 1}.txt`,
      rawText: newText.trim(),
      result: null,
      status: 'idle'
    };
    setItems([...items, newItem]);
    setNewText('');
    setNewFilename('');
  };

  const handleRemove = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleExportJsonArray = () => {
    const resultsOnly = items.map((i) => i.result || EnterpriseDataEngine.extract(i.rawText));
    const jsonStr = JSON.stringify(resultsOnly, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_extracted_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const processedCount = items.filter(i => i.status === 'done').length;

  return (
    <div className="glass-panel p-6 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-violet-400" />
            Batch Data Extraction Studio
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Process multiple unstructured documents in parallel ({processedCount}/{items.length} completed).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreloadAllPresets}
            className="px-3 py-2 bg-[#161c2e] hover:bg-[#1f2740] border border-white/10 text-gray-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
            title="Preload all 5 sample presets into batch queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Load Sample Queue
          </button>

          <button
            onClick={handleRunBatch}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
            Run Batch Engine ({items.length})
          </button>

          <button
            onClick={handleExportJsonArray}
            className="px-3.5 py-2 bg-[#161c2e] hover:bg-white/10 text-gray-200 border border-white/10 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Combined JSON
          </button>
        </div>
      </div>

      {/* Queue Add Box */}
      <div className="p-4 rounded-xl bg-[#080b15] border border-white/10 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-violet-300 uppercase tracking-wider font-mono">Add Document to Queue</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Filename (optional)"
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#121727] border border-white/10 text-gray-200 text-xs font-mono focus:outline-none focus:border-violet-500"
          />
          <textarea
            placeholder="Paste raw unstructured document text..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg bg-[#121727] border border-white/10 text-gray-200 text-xs font-mono focus:outline-none focus:border-violet-500 resize-none"
          />
          <button
            onClick={handleAddItem}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Batch Items List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="p-4 rounded-xl bg-[#090c18] border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-violet-300 font-semibold">{item.filename}</span>
                {item.status === 'done' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    Processed ({item.extractedAt})
                  </span>
                )}
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="text-gray-500 hover:text-rose-400 p-1 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#05070f] text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto border border-white/5">
                {item.rawText}
              </div>

              <div className="p-3 rounded-lg bg-[#05070f] text-emerald-400 max-h-32 overflow-y-auto border border-white/5">
                {item.result ? (
                  <pre className="text-xs">{JSON.stringify(item.result, null, 2)}</pre>
                ) : (
                  <span className="text-gray-600 italic">Click "Run Batch Engine" to extract...</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

