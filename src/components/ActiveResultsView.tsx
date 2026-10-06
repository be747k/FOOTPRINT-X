import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  Server,
  Layers,
  Shield,
  ShieldAlert,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Compass,
  Radio,
  FileCode,
  Terminal,
} from 'lucide-react';
import { FullScanResult } from '../types/osint';

interface ActiveResultsViewProps {
  scanResult: FullScanResult | null;
  isScanning: boolean;
  onOpenReportModal: () => void;
  terminalLogs: string[];
}

export const ActiveResultsView: React.FC<ActiveResultsViewProps> = ({
  scanResult,
  isScanning,
  onOpenReportModal,
  terminalLogs,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'network' | 'webstack' | 'terminal'>('network');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const net = scanResult?.network_recon;
  const web = scanResult?.web_stack;
  const geo = net?.geoip;

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('network')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
              activeSubTab === 'network'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Network & GeoIP (Exp 1)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('webstack')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
              activeSubTab === 'webstack'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Web Stack & TLS (Exp 5)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
              activeSubTab === 'terminal'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Recon Logs</span>
          </button>
        </div>

        <span className="text-xs font-mono text-slate-500 hidden sm:inline">
          Scan: {scanResult?.metadata?.scan_timestamp ? new Date(scanResult.metadata.scan_timestamp).toLocaleTimeString() : 'Ready'}
        </span>
      </div>

      {/* SUB-TAB 1: Network & GeoIP */}
      {activeSubTab === 'network' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: DNS Records Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-syne font-bold text-sm text-white">DNS RECORD TOPOLOGY</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {net?.dns_records_count || 0} Records Identified
                </span>
              </div>

              {/* A Records */}
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono uppercase text-cyan-400 font-semibold mb-1.5 flex items-center justify-between">
                    <span>A Records (IPv4 Host Mapping)</span>
                    <span className="text-slate-400 font-normal">Exp 1 Requirement</span>
                  </div>
                  <div className="space-y-1.5">
                    {net?.ip_addresses && net.ip_addresses.length > 0 ? (
                      net.ip_addresses.map((ip, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 bg-slate-950/70 border border-slate-800/80 rounded font-mono text-xs text-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-400 font-bold">A</span>
                            <span>{ip}</span>
                            {idx === 0 && (
                              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/40">
                                Primary
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(ip, `ip-${idx}`)}
                            className="text-slate-500 hover:text-slate-300"
                            title="Copy IP"
                          >
                            {copiedKey === `ip-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs font-mono text-slate-500 italic p-2 bg-slate-950 rounded">
                        No IPv4 records returned for target.
                      </p>
                    )}
                  </div>
                </div>

                {/* Reverse DNS (PTR) */}
                <div>
                  <div className="text-[11px] font-mono uppercase text-indigo-400 font-semibold mb-1">
                    Reverse DNS (PTR Resolution)
                  </div>
                  <div className="px-3 py-2 bg-slate-950/70 border border-slate-800/80 rounded font-mono text-xs text-slate-300">
                    {net?.reverse_dns ? (
                      <span className="text-emerald-300">{net.reverse_dns}</span>
                    ) : (
                      <span className="text-slate-500 italic">No reverse PTR host configured</span>
                    )}
                  </div>
                </div>

                {/* Mail Servers (MX) */}
                <div>
                  <div className="text-[11px] font-mono uppercase text-amber-400 font-semibold mb-1.5">
                    Mail Exchange (MX Records)
                  </div>
                  <div className="space-y-1">
                    {net?.mx_records && net.mx_records.length > 0 ? (
                      net.mx_records.map((mx, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-1.5 bg-slate-950/50 border border-slate-800/60 rounded font-mono text-xs text-slate-300"
                        >
                          <span className="truncate">{mx.exchange}</span>
                          <span className="text-amber-400 font-bold shrink-0 ml-2">Priority: {mx.priority}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs font-mono text-slate-500 italic p-1.5 bg-slate-950 rounded">
                        No MX records detected.
                      </p>
                    )}
                  </div>
                </div>

                {/* Nameservers (NS) */}
                <div>
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
                    Authoritative Name Servers (NS)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {net?.ns_records && net.ns_records.length > 0 ? (
                      net.ns_records.map((ns, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-300"
                        >
                          {ns}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-mono text-slate-500 italic">NS resolution pending</span>
                    )}
                  </div>
                </div>

                {/* TXT Records (SPF / DKIM / Verification) */}
                <div>
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
                    TXT Records (SPF / DMARC / Security Verifications)
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {net?.txt_records && net.txt_records.length > 0 ? (
                      net.txt_records.map((txt, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-slate-950/80 border border-slate-800/80 rounded font-mono text-[11px] text-slate-400 break-all"
                        >
                          {txt}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs font-mono text-slate-500 italic">No TXT records configured</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Geolocation & ISP Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-syne font-bold text-sm text-white">PHYSICAL GEOLOCATION & ASN</h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  PUBLIC GEOIP
                </span>
              </div>

              {/* Geographic Coordinates Radar Display */}
              <div className="relative h-44 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden mb-4 p-4 text-center">
                {/* Visual Radar Rings */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className="w-64 h-64 border border-cyan-400 rounded-full" />
                  <div className="w-48 h-48 border border-cyan-400 rounded-full absolute" />
                  <div className="w-32 h-32 border border-cyan-400 rounded-full absolute" />
                  <div className="w-16 h-16 border border-cyan-400 rounded-full absolute" />
                  <div className="w-full h-[1px] bg-cyan-400/30 absolute" />
                  <div className="h-full w-[1px] bg-cyan-400/30 absolute" />
                </div>

                <div className="relative z-10 space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <MapPin className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="font-syne font-bold text-base text-white">
                    {geo?.city || 'Unknown City'}, {geo?.country || 'Unknown Country'}
                  </div>
                  <div className="font-mono text-xs text-cyan-300">
                    LAT: {geo?.latitude ?? '0.000'} | LON: {geo?.longitude ?? '0.000'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Timezone: {geo?.timezone || 'UTC'}
                  </div>
                </div>
              </div>

              {/* Detailed GeoIP Table */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800/60">
                  <span className="text-slate-400">Internet Service Provider (ISP):</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[200px]" title={geo?.isp}>
                    {geo?.isp || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800/60">
                  <span className="text-slate-400">Autonomous System (ASN):</span>
                  <span className="text-cyan-300 font-semibold truncate max-w-[200px]" title={geo?.as}>
                    {geo?.as || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800/60">
                  <span className="text-slate-400">Hosting Organization:</span>
                  <span className="text-slate-200 truncate max-w-[200px]" title={geo?.org}>
                    {geo?.org || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800/60">
                  <span className="text-slate-400">Postal / Zip Code:</span>
                  <span className="text-slate-300">{geo?.zip || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Web Stack & TLS */}
      {activeSubTab === 'webstack' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Server Fingerprints & Technologies */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-syne font-bold text-sm text-white">HTTP BANNER & FINGERPRINT</h3>
                </div>
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  EXP-05
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase mb-1">Server Banner:</div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-cyan-300 font-semibold flex items-center justify-between">
                    <span>{web?.server_header || 'Hidden / Not Disclosed'}</span>
                    {web?.server_header && /\d+\.\d+/.test(web.server_header) && (
                      <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/40">
                        Version Leaked
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 uppercase mb-1">X-Powered-By Header:</div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-300">
                    {web?.x_powered_by ? (
                      <span className="text-amber-400 font-semibold">{web.x_powered_by} (Runtime Leaked)</span>
                    ) : (
                      <span className="text-emerald-400">Hardened (Header Omitted / Stripped)</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 uppercase mb-1.5">
                    Detected Technologies & Frameworks:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {web?.detected_technologies && web.detected_technologies.length > 0 ? (
                      web.detected_technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-indigo-950/60 border border-indigo-800/50 rounded text-xs text-indigo-200"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No distinctive framework headers detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 uppercase mb-1">HTTP Probe Target & Status:</div>
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-300 flex items-center justify-between">
                    <span className="truncate">{web?.url_probed || 'https://target'}</span>
                    <span className="text-emerald-400 font-bold ml-2">HTTP {web?.http_status || '200'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: SSL / TLS Certificate Analysis */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-syne font-bold text-sm text-white">TLS/SSL CERTIFICATE INSPECTION</h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  PORT 443
                </span>
              </div>

              {web?.ssl_info?.valid ? (
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Certificate Authority (Issuer):</span>
                    <span className="text-slate-200 font-semibold">{web.ssl_info.issuer || 'Unknown CA'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Negotiated Protocol:</span>
                    <span className="text-emerald-400 font-semibold">{web.ssl_info.protocol}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Cipher Suite:</span>
                    <span className="text-cyan-300 text-[11px]">{web.ssl_info.cipher}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Days Until Expiration:</span>
                    <span
                      className={`font-bold ${
                        (web.ssl_info.days_remaining ?? 999) < 30 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {web.ssl_info.days_remaining !== null ? `${web.ssl_info.days_remaining} Days` : 'N/A'}
                    </span>
                  </div>

                  {web.ssl_info.subject_alt_names && web.ssl_info.subject_alt_names.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase mb-1">
                        SANs ({web.ssl_info.subject_alt_names_count} Names):
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {web.ssl_info.subject_alt_names.map((san, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded"
                          >
                            {san}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-400">
                  <p className="text-amber-400 font-semibold mb-1">TLS Handshake Inactive or Private Cert</p>
                  <p>{web?.ssl_info?.error || 'Target port 443 did not complete TLS negotiation.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Live Terminal Stream */}
      {activeSubTab === 'terminal' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-200 font-bold">FOOTPRINT-X KERNEL EVENT LOG</span>
            </div>
            <span>Stream Mode: Passive</span>
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
            {terminalLogs.length > 0 ? (
              terminalLogs.map((log, index) => (
                <div key={index} className="text-slate-300 leading-relaxed font-mono flex items-start gap-2">
                  <span className="text-cyan-500 shrink-0">&gt;</span>
                  <span className={log.includes('CRITICAL') || log.includes('ERR') ? 'text-rose-400' : log.includes('SUCCESS') ? 'text-emerald-400' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-600 italic">No events logged yet. Execute a reconnaissance scan to start streaming.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
