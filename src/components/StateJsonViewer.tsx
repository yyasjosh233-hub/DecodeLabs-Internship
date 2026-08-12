import React, { useState, useEffect } from 'react';
import { Braces, Copy, Check, Download, AlignLeft, Code2, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { RobotFullState, JointState } from '../types/robotics';

interface StateJsonViewerProps {
  fullState: RobotFullState;
  onApplyJoints?: (joints: JointState) => void;
}

export const StateJsonViewer: React.FC<StateJsonViewerProps> = ({ fullState, onApplyJoints }) => {
  const [copied, setCopied] = useState(false);
  const [compact, setCompact] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const jsonString = compact
    ? JSON.stringify(fullState)
    : JSON.stringify(fullState, null, 2);

  // Sync jsonInputText when entering edit mode or state updates
  useEffect(() => {
    if (!isEditMode) {
      setJsonInputText(JSON.stringify({
        joint_states: fullState.joint_states,
        end_effector: fullState.end_effector
      }, null, 2));
    }
  }, [fullState, isEditMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robot_state_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonInputText);
      const joints: Partial<JointState> = parsed.joint_states || parsed.joints || parsed;

      if (
        typeof joints.q1 === 'number' &&
        typeof joints.q2 === 'number' &&
        typeof joints.q3 === 'number' &&
        typeof joints.q4 === 'number' &&
        typeof joints.q5 === 'number' &&
        typeof joints.q6 === 'number'
      ) {
        if (onApplyJoints) {
          onApplyJoints({
            q1: joints.q1,
            q2: joints.q2,
            q3: joints.q3,
            q4: joints.q4,
            q5: joints.q5,
            q6: joints.q6
          });
        }
        setStatusMessage({ text: '✓ Successfully applied JSON joint state to 6-DOF Robot!', isError: false });
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        setStatusMessage({ text: '❌ Invalid JSON schema: Expected joint_states object with q1..q6 numbers.', isError: true });
      }
    } catch (err: any) {
      setStatusMessage({ text: `❌ JSON Syntax Error: ${err.message}`, isError: true });
    }
  };

  return (
    <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-4 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Braces className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            {isEditMode ? 'Type & Edit Robot State JSON' : 'Live Robot Telemetry State JSON'}
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          
          {/* Mode Switcher */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isEditMode
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                : 'bg-[#161c2e] text-gray-300 border-white/10 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            {isEditMode ? 'View Live JSON' : 'Type / Edit JSON'}
          </button>

          {!isEditMode && (
            <>
              <button
                onClick={() => setCompact(!compact)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
                  compact ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-[#161c2e] text-gray-300 border-white/10'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                {compact ? 'Compact' : 'Formatted'}
              </button>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-[#161c2e] hover:bg-[#1f2740] border border-white/10 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </>
          )}

        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div className={`p-3 rounded-xl border font-mono text-xs flex items-center gap-2 ${
          statusMessage.isError
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Content Area: View or Interactive Type Mode */}
      {isEditMode ? (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-400 font-mono">
            Type or paste custom JSON configuration below to directly update joint state (<code className="text-cyan-300">q1..q6</code>):
          </p>
          <textarea
            value={jsonInputText}
            onChange={(e) => setJsonInputText(e.target.value)}
            rows={10}
            className="w-full p-4 rounded-xl bg-[#060812] border border-white/15 font-mono text-xs text-cyan-200 focus:outline-none focus:border-purple-500 leading-relaxed shadow-inner"
            placeholder={`{\n  "joint_states": {\n    "q1": 0,\n    "q2": -45,\n    "q3": 60,\n    "q4": 0,\n    "q5": 30,\n    "q6": 0\n  }\n}`}
          />
          <div className="flex justify-end">
            <button
              onClick={handleApplyJson}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 fill-current text-cyan-300" />
              Apply JSON State to Robot
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#060812] border border-white/10 font-mono text-xs text-gray-300 leading-relaxed max-h-72 overflow-auto">
          <pre className="text-emerald-400">
            {jsonString.split('\n').map((line, idx) => (
              <div key={idx} className="hover:bg-white/[0.02] px-1 rounded flex">
                <span className="w-8 select-none text-gray-600 text-right pr-3 font-mono">{idx + 1}</span>
                <span className="flex-1 whitespace-pre-wrap">{colorizeJsonLine(line)}</span>
              </div>
            ))}
          </pre>
        </div>
      )}

    </div>
  );
};

function colorizeJsonLine(line: string) {
  const nullRegex = /:\s*null/g;
  const numRegex = /:\s*(-?\d+(?:\.\d+)?)/g;
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

  if (numRegex.test(line)) {
    return (
      <span dangerouslySetInnerHTML={{
        __html: line
          .replace(/"([^"]+)":/g, '<span class="text-cyan-300">"$1"</span>:')
          .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="text-amber-300">$1</span>')
      }} />
    );
  }

  return <span className="text-gray-400">{line}</span>;
}
