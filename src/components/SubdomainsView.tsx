import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Download,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { SubdomainData } from '../types/osint';

interface SubdomainsViewProps {
  subdomainData: SubdomainData | null;
  targetDomain: string;
}

export const SubdomainsView: React.FC<SubdomainsViewProps> = ({
  subdomainData,
  targetDomain,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'high_risk'>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const subdomains = subdomainData?.subdomains || [];
  const highRiskList = subdomainData?.high_risk_subdomains || [];

  const filtered = useMemo(() => {
    return subdomains.filter((sub) => {
      const matchSearch = sub.fqdn.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterMode === 'high_risk') {
        return matchSearch && sub.is_high_risk;
      }
      return matchSearch;
    });
  }, [subdomains, searchTerm, filterMode]);

  const copySub = (fqdn: string, idx: number) => {
    navigator.clipboard.writeText(fqdn);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const exportListAsText = () => {
    const content = subdomains.map((s) => s.fqdn).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetDomain || 'domain'}_subdomains_crtsh.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="font-syne font-bold text-lg text-white">
                CERTIFICATE TRANSPARENCY SUBDOMAIN SURFACE (EXP-02)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Discovered historical and active subdomains logged in public cryptographic TLS ledgers (CRT.sh).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportListAsText}
              disabled={subdomains.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-mono text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Subdomains (.txt)</span>
            </button>
          </div>
        </div>

        {/* Counter Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Subdomains Logged</span>
            <div className="text-3xl font-mono font-extrabold text-white mt-1">
              {subdomainData?.total_found ?? 0}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-1 block">
              Deduplicated Public Records
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">High Risk Attack Nodes</span>
            <div className="text-3xl font-mono font-extrabold text-amber-400 mt-1">
              {highRiskList.length}
            </div>
            <span className="text-xs font-mono text-amber-400/80 mt-1 block">
              dev / stage / vpn / admin / api
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Telemetry Provider</span>
            <div className="text-lg font-mono font-bold text-cyan-400 mt-2 truncate">
              CRT.sh CT Logs
            </div>
            <span className="text-xs font-mono text-slate-400 mt-1 block">
              Sectigo Certificate Transparency
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subdomain (e.g. api, dev, mail)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterMode === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              All Records ({subdomains.length})
            </button>
            <button
              onClick={() => setFilterMode('high_risk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterMode === 'high_risk'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Sensitive / High Risk ({highRiskList.length})
            </button>
          </div>
        </div>

        {/* Subdomains Table */}
        <div className="max-h-[500px] overflow-y-auto border border-slate-800/80 rounded-lg">
          {filtered.length > 0 ? (
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Fully Qualified Domain Name (FQDN)</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-slate-500">{idx + 1}</td>
                    <td className="p-3 text-slate-200 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{item.fqdn}</span>
                        {item.is_high_risk && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                            High Risk
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] ${
                          item.is_high_risk ? 'text-amber-400 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {item.classification}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => copySub(item.fqdn, idx)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copy FQDN"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 inline" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 inline" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-xs font-mono text-slate-500 italic bg-slate-950">
              {subdomainData?.error
                ? subdomainData.error
                : 'No subdomains found matching the current search parameters or target scan is pending.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
