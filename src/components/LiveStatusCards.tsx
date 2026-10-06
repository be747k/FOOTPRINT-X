import React from 'react';
import {
  Globe,
  MapPin,
  Server,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Layers,
  Lock,
  ExternalLink,
  Wifi,
} from 'lucide-react';
import { FullScanResult } from '../types/osint';

interface LiveStatusCardsProps {
  scanResult: FullScanResult | null;
  isScanning: boolean;
}

export const LiveStatusCards: React.FC<LiveStatusCardsProps> = ({ scanResult, isScanning }) => {
  const net = scanResult?.network_recon;
  const web = scanResult?.web_stack;
  const subs = scanResult?.subdomain_recon;
  const risk = scanResult?.risk_assessment;

  // Primary IP
  const primaryIp = net?.ip_addresses?.[0] || 'Resolving...';
  const geo = net?.geoip;
  const locationStr = geo?.city && geo.city !== 'Unknown' 
    ? `${geo.city}, ${geo.country}` 
    : geo?.country || 'Pending lookup';
  const ispStr = geo?.isp || 'ISP Query Pending';
  const asnStr = geo?.as || 'ASN Pending';

  // Server
  const serverStr = web?.server_header || 'Probing headers...';
  const techCount = web?.detected_technologies?.length || 0;
  const sslProtocol = web?.ssl_info?.protocol || 'TLS 1.3';

  // Subdomains
  const subTotal = subs?.total_found ?? 0;
  const highRiskSubCount = subs?.high_risk_subdomains?.length ?? 0;

  // Risk Score
  const score = risk?.score ?? 0;
  const riskLevel = risk?.risk_level ?? 'INITIALIZING';
  const findingsCount = risk?.findings_count ?? 0;

  const getScoreColor = (val: number) => {
    if (val >= 75) return { stroke: '#ef4444', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    if (val >= 50) return { stroke: '#f97316', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    if (val >= 25) return { stroke: '#eab308', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    return { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  };

  const scoreTheme = getScoreColor(score);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Target IP & Geolocation */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 relative overflow-hidden backdrop-blur-sm group hover:border-cyan-500/40 transition-all shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target IP & Geo</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
            EXP-01
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono font-bold text-lg text-white tracking-tight truncate" title={primaryIp}>
              {primaryIp}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 truncate" title={locationStr}>
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{locationStr}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate max-w-[130px]" title={ispStr}>{ispStr}</span>
            <span className="text-cyan-400 font-semibold shrink-0" title={asnStr}>
              {geo?.country_code ? `[${geo.country_code}]` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Server Type & Technology Stack */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 relative overflow-hidden backdrop-blur-sm group hover:border-cyan-500/40 transition-all shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Server & Web Stack</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
            EXP-05
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="font-mono font-bold text-base text-white tracking-tight truncate" title={serverStr}>
            {serverStr}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono text-[11px]">{sslProtocol} / TLS Encrypted</span>
          </div>

          <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Technologies Detected:</span>
            <span className="text-indigo-400 font-bold">{techCount} Found</span>
          </div>
        </div>
      </div>

      {/* Card 3: Attack Surface (Subdomains) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 relative overflow-hidden backdrop-blur-sm group hover:border-cyan-500/40 transition-all shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Discovered Surface (CT)</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
            EXP-02
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-2xl text-white">
              {subTotal}
            </span>
            <span className="text-xs text-slate-400 font-mono">Logged Subdomains</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${highRiskSubCount > 0 ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="font-mono text-[11px] text-amber-300">
              {highRiskSubCount} Sensitive Nodes (dev/vpn/admin)
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Cert Logs:</span>
            <span className="text-slate-300">CRT.sh Transparency</span>
          </div>
        </div>
      </div>

      {/* Card 4: Overall Exposure Risk Score (0-100) */}
      <div className={`bg-slate-900/80 border rounded-xl p-4.5 relative overflow-hidden backdrop-blur-sm transition-all shadow-sm ${scoreTheme.border}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className={`w-3.5 h-3.5 ${scoreTheme.text}`} />
            <span>Exposure Risk Score</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
            EXP-08
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`font-mono font-extrabold text-3xl ${scoreTheme.text}`}>
                {score}
              </span>
              <span className="font-mono text-xs text-slate-400">/100</span>
            </div>
            <div className={`text-[11px] font-mono font-semibold tracking-wider uppercase mt-0.5 ${scoreTheme.text}`}>
              {riskLevel}
            </div>
          </div>

          {/* Circular Gauge Representation */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke={scoreTheme.stroke}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-[10px] font-bold text-slate-200">
              {score}%
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Active Findings:</span>
          <span className={`font-bold ${scoreTheme.text}`}>{findingsCount} items</span>
        </div>
      </div>
    </div>
  );
};
