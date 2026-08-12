import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal } from 'lucide-react';

export const CodeSnippetGenerator: React.FC = () => {
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  const copyCode = (code: string, lang: string) => {
    navigator.clipboard.writeText(code);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  const pythonSnippet = `from python.extractor import EnterpriseDataExtractor

# Initialize engine
extractor = EnterpriseDataExtractor()

# Raw unstructured text
raw_text = """
Customer Name: Yashwanth
Email: yash@gmail.com
Phone: 9876543210
Company: Samsung
Product: Galaxy S25
Order ID: ORD12345
City: Hyderabad
Status: Delivered
Amount: ₹65000
"""

# Extract structured dict matching exact 14-field schema
data = extractor.extract(raw_text)
print("Extracted Dict:", data)

# Output pure JSON string
json_output = extractor.to_json(raw_text)
print("Pure JSON:", json_output)
`;

  const tsSnippet = `import { EnterpriseDataEngine } from './src/services/engine';

const rawText = \`Customer Name: Yashwanth
Email: yash@gmail.com
Phone: 9876543210
Company: Samsung
Product: Galaxy S25
Order ID: ORD12345
City: Hyderabad
Status: Delivered
Amount: ₹65000\`;

// Extract deterministic JSON schema
const extracted = EnterpriseDataEngine.extract(rawText);

// Format compact or formatted JSON
console.log(EnterpriseDataEngine.toFormattedJson(extracted));
`;

  const curlSnippet = `# CLI execution via Python module
python -m python.extractor << 'EOF'
Customer Name: Yashwanth
Email: yash@gmail.com
Phone: 9876543210
Company: Samsung
Product: Galaxy S25
Order ID: ORD12345
City: Hyderabad
Status: Delivered
Amount: ₹65000
EOF
`;

  return (
    <div className="glass-panel p-6 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-6">
      
      <div className="pb-4 border-b border-white/10">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-violet-400" />
          Production Integration Code SDKs & Prompt Security
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Copy-paste ready Python & TypeScript snippets to incorporate this Enterprise Extraction Engine into your backend data pipelines.
        </p>
      </div>

      {/* Python Snippet */}
      <div className="rounded-xl border border-white/10 bg-[#080b15] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-violet-300 font-semibold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-violet-400" />
            Python SDK (`python/extractor.py`)
          </span>
          <button
            onClick={() => copyCode(pythonSnippet, 'python')}
            className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs flex items-center gap-1 transition-all"
          >
            {copiedLang === 'python' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
            {copiedLang === 'python' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="font-mono text-xs text-gray-300 overflow-x-auto p-3 rounded-lg bg-[#05070e] border border-white/5">
          {pythonSnippet}
        </pre>
      </div>

      {/* TypeScript Snippet */}
      <div className="rounded-xl border border-white/10 bg-[#080b15] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Node.js / TypeScript SDK (`src/services/engine.ts`)
          </span>
          <button
            onClick={() => copyCode(tsSnippet, 'ts')}
            className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs flex items-center gap-1 transition-all"
          >
            {copiedLang === 'ts' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
            {copiedLang === 'ts' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="font-mono text-xs text-gray-300 overflow-x-auto p-3 rounded-lg bg-[#05070e] border border-white/5">
          {tsSnippet}
        </pre>
      </div>

      {/* CLI Snippet */}
      <div className="rounded-xl border border-white/10 bg-[#080b15] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-emerald-300 font-semibold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            Command Line Pipeline (CLI Stdin Reader)
          </span>
          <button
            onClick={() => copyCode(curlSnippet, 'cli')}
            className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs flex items-center gap-1 transition-all"
          >
            {copiedLang === 'cli' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
            {copiedLang === 'cli' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="font-mono text-xs text-gray-300 overflow-x-auto p-3 rounded-lg bg-[#05070e] border border-white/5">
          {curlSnippet}
        </pre>
      </div>

    </div>
  );
};

