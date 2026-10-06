import React from 'react';
import {
  ShieldAlert,
  Globe,
  Radio,
  Server,
  Layers,
  Users,
  FileText,
  GraduationCap,
  Terminal,
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
  Compass,
} from 'lucide-react';
import { FullScanResult } from '../types/osint';
import { PRESET_TARGETS, LAB_EXPERIMENTS } from '../data/labCurriculum';

interface OverviewViewProps {
  scanResult: FullScanResult | null;
  onNavigateTab: (tab: string) => void;
  onSelectPreset: (domain: string, username: string) => void;
  onOpenReportModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  scanResult,
  onNavigateTab,
  onSelectPreset,
  onOpenReportModal,
}) => {
  const target = scanResult?.metadata?.target || 'scanme.nmap.org';
  const score = scanResult?.risk_assessment?.score ?? 0;
  const riskLevel = scanResult?.risk_assessment?.risk_level ?? 'MONITORED';

  return (
    <div className="space-y-6">
      {/* Hero OSINT Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-8 overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Academic Mini-Project Platform | Curriculum IoTCSBCL704</span>
          </div>

          <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
            FOOTPRINT-X: Automated Surface Exposure & Digital Footprint Analyzer
          </h2>

          <p className="text-slate-300 text-sm mt-3 leading-relaxed">
            A production-ready reconnaissance framework orchestrating non-intrusive DNS topology mapping, GeoIP & ASN identification, HTTP header fingerprinting, Certificate Transparency subdomain enumeration, and developer identity correlation.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigateTab('recon')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Radio className="w-4 h-4" />
              <span>Launch Reconnaissance</span>
            </button>

            <button
              onClick={() => onNavigateTab('lab')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-all"
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>IoTCSBCL704 Lab Mapping</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Formal Audit Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module Architecture 4-Pillar Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-syne font-bold text-sm text-slate-300 tracking-wider uppercase">
            Core Reconnaissance Modules & Syllabus Coverage
          </h3>
          <span className="text-xs font-mono text-slate-500">Zero active packet injection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1 */}
          <div
            onClick={() => onNavigateTab('results')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
              Module 1 · Exp 1
            </span>
            <h4 className="font-syne font-bold text-sm text-white mt-1">Network & GeoIP Mapper</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Forward/Reverse DNS lookup (A, MX, TXT, NS, PTR) and ip-api.com physical coordinates, ISP, ASN.
            </p>
          </div>

          {/* Module 2 */}
          <div
            onClick={() => onNavigateTab('results')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
              <Server className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">
              Module 2 · Exp 5 & 6
            </span>
            <h4 className="font-syne font-bold text-sm text-white mt-1">Web Server & Header Audit</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              HTTP banner grabbing, X-Powered-By detection, and defensive HSTS, CSP, and X-Frame-Options audits.
            </p>
          </div>

          {/* Module 3 */}
          <div
            onClick={() => onNavigateTab('subdomains')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-800/50 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
              Module 3 · Exp 2
            </span>
            <h4 className="font-syne font-bold text-sm text-white mt-1">Subdomain Recon (CT)</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Queries public Certificate Transparency logs via CRT.sh to discover unlisted subdomains and dev nodes.
            </p>
          </div>

          {/* Module 4 */}
          <div
            onClick={() => onNavigateTab('identity')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
              Module 4 · Exp 7
            </span>
            <h4 className="font-syne font-bold text-sm text-white mt-1">Identity & Social Finder</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Correlates public usernames across GitHub, Reddit, HackerNews, Keybase PGP, and developer accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launch Benchmark Targets */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-syne font-bold text-sm text-white">
            AUTHORIZED BENCHMARK TARGET PRESETS
          </h3>
          <span className="text-xs font-mono text-slate-400">1-Click Lab Evaluation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TARGETS.map((preset) => (
            <div
              key={preset.domain}
              className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span className="truncate">{preset.label}</span>
                  <span className="text-[10px] font-mono text-cyan-400 shrink-0">Exp {preset.recommendedExp}</span>
                </div>
                <div className="text-[11px] font-mono text-cyan-300 mt-0.5 truncate">{preset.domain}</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</p>
              </div>

              <button
                onClick={() => {
                  onSelectPreset(preset.domain, preset.username);
                  onNavigateTab('recon');
                }}
                className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-mono text-cyan-400 border border-slate-700/60 transition-colors w-full"
              >
                <span>Select Target</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
