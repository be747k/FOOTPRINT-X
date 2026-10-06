import React, { useState } from 'react';
import {
  Search,
  Radio,
  Play,
  RotateCw,
  Terminal,
  Globe,
  User,
  CheckCircle2,
  Bookmark,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PRESET_TARGETS, LAB_EXPERIMENTS } from '../data/labCurriculum';

interface TargetReconPanelProps {
  targetInput: string;
  setTargetInput: (val: string) => void;
  usernameInput: string;
  setUsernameInput: (val: string) => void;
  onExecuteScan: (moduleFilter?: string) => void;
  isScanning: boolean;
  engineMode: 'node' | 'python';
  setEngineMode: (m: 'node' | 'python') => void;
  selectedExp: number | null;
  setSelectedExp: (exp: number | null) => void;
}

export const TargetReconPanel: React.FC<TargetReconPanelProps> = ({
  targetInput,
  setTargetInput,
  usernameInput,
  setUsernameInput,
  onExecuteScan,
  isScanning,
  engineMode,
  setEngineMode,
  selectedExp,
  setSelectedExp,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md mb-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h2 className="font-syne font-bold text-base text-white tracking-wide">
              TARGET RECONNAISSANCE CONFIGURATOR
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure passive OSINT parameters for surface exposure analysis & laboratory experimentation.
          </p>
        </div>

        {/* Engine Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Execution Runtime:</span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setEngineMode('node')}
              className={`px-2.5 py-1 rounded transition-colors ${
                engineMode === 'node'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Node.js Native
            </button>
            <button
              onClick={() => setEngineMode('python')}
              className={`px-2.5 py-1 rounded transition-colors ${
                engineMode === 'python'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Python 3 Core (CLI)
            </button>
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        {/* Target Domain / Host */}
        <div className="md:col-span-7">
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Domain / Hostname / IP (Modules 1, 2, 3)</span>
            </span>
            <span className="text-[10px] text-cyan-400 lowercase font-normal">e.g. scanme.nmap.org</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="e.g. scanme.nmap.org or 45.33.32.156"
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-2.5 text-sm font-mono text-cyan-100 placeholder:text-slate-600 transition-all outline-none"
            />
            {targetInput && (
              <button
                onClick={() => setTargetInput('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-mono"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Target Username / Handle */}
        <div className="md:col-span-5">
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Identity / Username (Module 4)</span>
            </span>
            <span className="text-[10px] text-indigo-400 lowercase font-normal">e.g. torvalds</span>
          </label>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="e.g. fyodor or security_admin"
            className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-2.5 text-sm font-mono text-indigo-100 placeholder:text-slate-600 transition-all outline-none"
          />
        </div>
      </div>

      {/* Preset Academic Benchmark Targets */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-slate-400">
          <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Benchmark Presets (Authorized Lab Targets):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_TARGETS.map((preset) => (
            <button
              key={preset.domain}
              onClick={() => {
                setTargetInput(preset.domain);
                setUsernameInput(preset.username);
                setSelectedExp(preset.recommendedExp);
              }}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                targetInput === preset.domain
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-0.5">
                <span className="truncate">{preset.label}</span>
                <span className="text-[10px] font-mono text-cyan-400 shrink-0 ml-1">
                  Exp {preset.recommendedExp}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">{preset.domain}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Lab Experiment Focus Filter */}
      <div className="mb-6 p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Academic Focus Filter (IoTCSBCL704):</span>
          </span>
          {selectedExp && (
            <button
              onClick={() => setSelectedExp(null)}
              className="text-[11px] text-cyan-400 hover:underline font-mono"
            >
              Reset to Full Recon (All Modules)
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedExp(null)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              selectedExp === null
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Modules (Full Surface Audit)
          </button>
          {LAB_EXPERIMENTS.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setSelectedExp(exp.exp_number)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                selectedExp === exp.exp_number
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Exp {exp.exp_number}: {exp.title.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Passive Recon (Zero active packet exploits or intrusive probes)</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onExecuteScan()}
            disabled={isScanning || !targetInput.trim()}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-lg text-sm font-mono font-bold transition-all shadow-lg ${
              isScanning || !targetInput.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
            }`}
          >
            {isScanning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Running Pipeline ({engineMode === 'python' ? 'Python CLI' : 'Node Engine'})...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Complete Surface Recon</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
