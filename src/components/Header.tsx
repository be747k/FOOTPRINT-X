import React from 'react';
import {
  ShieldAlert,
  Play,
  RotateCw,
  Printer,
  FileCode,
  Terminal,
  Cpu,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeTarget: string;
  isScanning: boolean;
  onTriggerScan: () => void;
  onOpenReportModal: () => void;
  engineMode: 'node' | 'python';
  setEngineMode: (mode: 'node' | 'python') => void;
  onQuickPreset: (domain: string, user?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTarget,
  isScanning,
  onTriggerScan,
  onOpenReportModal,
  engineMode,
  setEngineMode,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left: Status and Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <h1 className="font-syne font-bold text-sm tracking-wider text-slate-100 hidden sm:block">
            SURFACE EXPOSURE & DIGITAL FOOTPRINT ANALYZER
          </h1>
        </div>

        <span className="text-slate-600 hidden md:inline">|</span>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Target:</span>
          <span className="text-cyan-300 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {activeTarget || 'scanme.nmap.org'}
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Engine Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setEngineMode('node')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              engineMode === 'node'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="High-Speed Node.js runtime engine"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Node Engine</span>
          </button>
          <button
            onClick={() => setEngineMode('python')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              engineMode === 'python'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Execute Python 3 Core (scripts/footprint_x_core.py)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Python 3 Core</span>
          </button>
        </div>

        {/* Scan Button */}
        <button
          onClick={onTriggerScan}
          disabled={isScanning}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shadow-md ${
            isScanning
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]'
          }`}
        >
          {isScanning ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Recon</span>
            </>
          )}
        </button>

        {/* Generate Formal Audit Report Modal Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
          title="Open printable academic audit report"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Formal Audit</span>
        </button>
      </div>
    </header>
  );
};
