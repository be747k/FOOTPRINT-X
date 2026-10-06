import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Layers,
  FileCheck,
} from 'lucide-react';
import { FullScanResult, RiskFinding, SecurityHeaderItem } from '../types/osint';

interface RiskMetricsViewProps {
  scanResult: FullScanResult | null;
  onOpenReportModal: () => void;
}

export const RiskMetricsView: React.FC<RiskMetricsViewProps> = ({
  scanResult,
  onOpenReportModal,
}) => {
  const risk = scanResult?.risk_assessment;
  const web = scanResult?.web_stack;
  const secHeaders = web?.security_headers || {};

  const score = risk?.score ?? 0;
  const riskLevel = risk?.risk_level ?? 'CALCULATING';
  const findings = risk?.findings || [];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-800/60';
      case 'HIGH':
        return 'bg-orange-950 text-orange-300 border-orange-800/60';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-300 border-amber-800/60';
      case 'LOW':
        return 'bg-blue-950 text-blue-300 border-blue-800/60';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const headerKeys: { key: string; label: string; desc: string }[] = [
    {
      key: 'strict_transport_security',
      label: 'Strict-Transport-Security (HSTS)',
      desc: 'Enforces HTTPS and defends against SSL stripping downgrade attacks.',
    },
    {
      key: 'content_security_policy',
      label: 'Content-Security-Policy (CSP)',
      desc: 'Restricts untrusted script execution and mitigates Cross-Site Scripting (XSS).',
    },
    {
      key: 'x_frame_options',
      label: 'X-Frame-Options (Clickjacking)',
      desc: 'Prevents unauthorized framing of application pages in hidden iframes.',
    },
    {
      key: 'x_content_type_options',
      label: 'X-Content-Type-Options (MIME Sniffing)',
      desc: 'Prevents browsers from executing user assets under erroneous MIME interpretations.',
    },
    {
      key: 'referrer_policy',
      label: 'Referrer-Policy',
      desc: 'Controls referrer data sent in cross-origin request headers.',
    },
    {
      key: 'permissions_policy',
      label: 'Permissions-Policy',
      desc: 'Restricts access to powerful browser capabilities (camera, microphone, geolocation).',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Score Gauge & Executive Risk Summary */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <h2 className="font-syne font-bold text-lg text-white">
                SURFACE EXPOSURE & CVSS-WEIGHTED THREAT MATRIX
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Aggregated passive reconnaissance risk computation mapped to IoTCSBCL704 Experiment 6 & Experiment 8.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
          >
            Generate Formal Audit Report
          </button>
        </div>

        {/* Score Breakdown Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Composite Exposure Index</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-mono font-extrabold text-white">{score}</span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
            </div>
            <span className="text-xs font-mono font-semibold text-cyan-400 mt-1 block">
              {riskLevel}
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Flagged Findings</span>
            <div className="text-3xl font-mono font-extrabold text-white mt-1">
              {findings.length}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-1 block">
              Vulnerabilities & Disclosures
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">High/Critical Deficits</span>
            <div className="text-3xl font-mono font-extrabold text-rose-400 mt-1">
              {findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length}
            </div>
            <span className="text-xs font-mono text-rose-400/80 mt-1 block">
              Urgent Remediation Required
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Security Header Score</span>
            <div className="text-3xl font-mono font-extrabold text-emerald-400 mt-1">
              {Object.values(secHeaders).filter((h) => h.present).length} / {headerKeys.length}
            </div>
            <span className="text-xs font-mono text-emerald-400/80 mt-1 block">
              Headers Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Module 2 / Exp 6: Defensive Security Headers Audit */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="font-syne font-bold text-sm text-white">
              HTTP DEFENSIVE SECURITY HEADERS AUDIT (EXP-06)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">RFC & OWASP Recommended</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {headerKeys.map(({ key, label, desc }) => {
            const header = secHeaders[key];
            const isPresent = Boolean(header?.present);

            return (
              <div
                key={key}
                className={`p-3.5 rounded-lg border transition-all ${
                  isPresent
                    ? 'bg-slate-950/60 border-slate-800/80'
                    : 'bg-rose-950/10 border-rose-900/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {isPresent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-mono font-bold text-xs text-white">{label}</span>
                  </div>

                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase font-bold shrink-0 ${
                      isPresent
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                        : 'bg-rose-950 text-rose-300 border-rose-800/60'
                    }`}
                  >
                    {isPresent ? 'ACTIVE' : 'MISSING'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-2">{desc}</p>

                {isPresent && header?.value && (
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-emerald-300 truncate" title={header.value}>
                    Value: {header.value}
                  </div>
                )}

                {!isPresent && (
                  <div className="p-1.5 bg-rose-950/30 rounded border border-rose-900/40 font-mono text-[10px] text-rose-200">
                    Fix: {header?.recommendation || 'Implement this security header in reverse proxy or web server configuration.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Granular Vulnerability & Surface Observation Findings Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-syne font-bold text-sm text-white">
              RECONNAISSANCE FINDINGS & CVSS EXPOSURE CATALOG
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {findings.length} Classified Items
          </span>
        </div>

        {findings.length > 0 ? (
          <div className="space-y-3">
            {findings.map((f, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded border font-bold ${getSeverityBadge(
                        f.severity
                      )}`}
                    >
                      {f.severity} (CVSS {f.cvss})
                    </span>
                    <h4 className="font-syne font-bold text-xs text-white">{f.title}</h4>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">{f.category}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="text-slate-400">
                    <strong className="text-slate-300 font-mono">Impact:</strong> {f.impact}
                  </p>
                  <div className="p-2 bg-slate-900 border border-slate-800/80 rounded font-mono text-[11px] text-emerald-300 flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-200">Remediation:</strong> {f.remediation}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-mono text-slate-500 italic bg-slate-950 rounded-lg">
            No active vulnerabilities detected or scan pending.
          </div>
        )}
      </div>
    </div>
  );
};
