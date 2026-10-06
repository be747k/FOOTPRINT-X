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
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeTarget: string;
  isScanning: boolean;
  riskScore: number | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeTarget,
  isScanning,
  riskScore,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe, badge: null },
    { id: 'recon', label: 'Target Recon', icon: Radio, badge: isScanning ? 'SCANNING' : null },
    { id: 'results', label: 'Active Results', icon: Activity, badge: null },
    { id: 'risk', label: 'Risk Metrics', icon: ShieldAlert, badge: riskScore !== null ? `${riskScore}/100` : null },
    { id: 'subdomains', label: 'Subdomains (CT)', icon: Layers, badge: null },
    { id: 'identity', label: 'Identity Matrix', icon: Users, badge: null },
    { id: 'export', label: 'Export Center', icon: FileText, badge: 'PDF/JSON' },
    { id: 'lab', label: 'Lab Mapping (IoTCSBCL704)', icon: GraduationCap, badge: 'ACADEMIC' },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen shrink-0 backdrop-blur-md select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-syne font-bold text-lg tracking-wide text-white">FOOTPRINT</span>
              <span className="font-syne font-bold text-lg text-cyan-400">-X</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">SURFACE OSINT LAB</p>
          </div>
        </div>

        {/* Lab Curriculum Badge */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-slate-400 font-mono">Curriculum:</span>
          <span className="font-mono text-cyan-300 font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
            IoTCSBCL704
          </span>
        </div>
      </div>

      {/* Target Status Indicator */}
      <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Target In Scope</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isScanning
                  ? 'bg-amber-400 animate-ping'
                  : activeTarget
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                  : 'bg-slate-600'
              }`}
            />
            <span className="font-mono text-[10px] text-slate-400">
              {isScanning ? 'PROBING' : activeTarget ? 'LOCKED' : 'IDLE'}
            </span>
          </span>
        </div>
        <p className="font-mono text-xs text-cyan-300 truncate" title={activeTarget || 'No Target Configured'}>
          {activeTarget || 'No target configured'}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    item.id === 'risk'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : item.id === 'lab'
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
        <div className="flex items-center justify-between font-mono mb-1">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dual Core Engine</span>
          </span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Python 3.10 + Node.js</span>
          <span>v2.4-Lab</span>
        </div>
      </div>
    </aside>
  );
};
