import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldAlert,
  FileCode,
  CheckCircle,
  Award,
  Globe,
  MapPin,
  Server,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FullScanResult } from '../types/osint';

interface ExportAuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: FullScanResult | null;
}

export const ExportAuditReportModal: React.FC<ExportAuditReportModalProps> = ({
  isOpen,
  onClose,
  scanResult,
}) => {
  const [studentName, setStudentName] = useState('Cybersecurity Student');
  const [rollNumber, setRollNumber] = useState('21CS089 / B-1');
  const [labBatch, setLabBatch] = useState('IoTCSBCL704 Batch A');

  if (!isOpen) return null;

  const net = scanResult?.network_recon;
  const web = scanResult?.web_stack;
  const subs = scanResult?.subdomain_recon;
  const idData = scanResult?.identity_recon;
  const risk = scanResult?.risk_assessment;

  const score = risk?.score ?? 0;
  const riskLevel = risk?.risk_level ?? 'ASSESSED';
  const findings = risk?.findings || [];
  const target = scanResult?.metadata?.target || 'target';

  const downloadJson = () => {
    const jsonStr = JSON.stringify(scanResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FOOTPRINT-X_${target}_ScanAudit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadHtmlReport = () => {
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>FOOTPRINT-X Audit Report - ${target}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; max-width: 900px; margin: auto; }
  h1 { font-size: 24px; color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }
  h2 { font-size: 18px; color: #0369a1; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
  th { background: #f8fafc; font-weight: 600; }
  .score-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 8px; margin: 16px 0; }
  .score { font-size: 32px; font-weight: bold; color: #0284c7; }
  .critical { color: #dc2626; font-weight: bold; }
  .high { color: #ea580c; font-weight: bold; }
  .medium { color: #d97706; }
  .remediation { background: #f8fafc; padding: 8px; border-left: 3px solid #0284c7; font-family: monospace; font-size: 12px; }
  .signoff { margin-top: 60px; display: flex; justify-content: space-between; border-top: 1px solid #94a3b8; padding-top: 20px; }
</style>
</head>
<body>
<h1>FOOTPRINT-X: Surface Exposure & Digital Footprint Audit</h1>
<p><strong>Academic Lab:</strong> IoTCSBCL704 | <strong>Target Scope:</strong> ${target} | <strong>Date:</strong> ${new Date().toUTCString()}</p>
<p><strong>Investigator:</strong> ${studentName} (${rollNumber}) | <strong>Batch:</strong> ${labBatch}</p>

<div class="score-box">
  <div class="score">${score} / 100</div>
  <p><strong>Risk Posture:</strong> ${riskLevel}</p>
  <p>Evaluated using CVSS-weighted multi-vector surface exposure heuristics.</p>
</div>

<h2>1. Executive Summary</h2>
<p>Passive reconnaissance was performed against <code>${target}</code> adhering to non-intrusive OSINT protocols. The asset is hosted on IP <code>${net?.ip_addresses?.[0] || 'N/A'}</code> (${net?.geoip?.country || 'Unknown'}, ${net?.geoip?.isp || 'ISP'}) using web daemon <code>${web?.server_header || 'Unknown'}</code>. Total subdomains discovered via Certificate Transparency: <code>${subs?.total_found || 0}</code>.</p>

<h2>2. Technical Observation Matrix</h2>
<table>
  <tr><th>Reconnaissance Module</th><th>Key Observation</th><th>Security Evaluation</th></tr>
  <tr><td>Network & DNS (Exp 1)</td><td>${net?.ip_addresses?.join(', ') || 'N/A'} (PTR: ${net?.reverse_dns || 'None'})</td><td>Resolved</td></tr>
  <tr><td>GeoIP & ASN (Exp 1)</td><td>${net?.geoip?.city || 'N/A'}, ${net?.geoip?.country || 'N/A'} | ${net?.geoip?.as || 'N/A'}</td><td>Public Routing Active</td></tr>
  <tr><td>Web Server Daemon (Exp 5)</td><td>${web?.server_header || 'Hidden'}</td><td>${web?.server_header && /\d/.test(web.server_header) ? 'Version Leak' : 'Standard'}</td></tr>
  <tr><td>Security Headers (Exp 6)</td><td>HSTS: ${web?.security_headers?.strict_transport_security?.present ? 'Enforced' : 'Missing'} | CSP: ${web?.security_headers?.content_security_policy?.present ? 'Enforced' : 'Missing'}</td><td>Audit Complete</td></tr>
  <tr><td>Subdomain Surface (Exp 2)</td><td>${subs?.total_found || 0} Records (${subs?.high_risk_subdomains?.length || 0} Sensitive)</td><td>Surface Mapped</td></tr>
  <tr><td>Digital Identity (Exp 7)</td><td>${idData?.match_count || 0} Cross-Platform Matches</td><td>HUMINT Profiled</td></tr>
</table>

<h2>3. Vulnerability Findings & Remediation Steps</h2>
${findings.map((f, i) => `
  <div style="margin-bottom: 16px;">
    <p><strong>${i+1}. [${f.severity} - CVSS ${f.cvss}] ${f.title}</strong></p>
    <p style="font-size: 13px; color: #475569;">${f.impact}</p>
    <div class="remediation">Remediation: ${f.remediation}</div>
  </div>
`).join('')}

<div class="signoff">
  <div>
    <p><strong>Student Signature:</strong> _______________________</p>
    <p>${studentName}</p>
  </div>
  <div>
    <p><strong>Lab Evaluator Signature:</strong> _______________________</p>
    <p>Course Instructor (IoTCSBCL704)</p>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FOOTPRINT-X_${target}_AuditReport.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Controls Header (Non-printable) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-syne font-bold text-sm text-white">
                FORMAL ACADEMIC AUDIT REPORT ENGINE
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Curriculum Standard: IoTCSBCL704 Exp 12
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={downloadHtmlReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export HTML</span>
            </button>

            <button
              onClick={downloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Raw JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Student Metadata Configuration Bar (Non-printable) */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 no-print shrink-0">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase">Student Name:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase">Register / Roll #:</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase">Lab Batch / Division:</label>
            <input
              type="text"
              value={labBatch}
              onChange={(e) => setLabBatch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200"
            />
          </div>
        </div>

        {/* Printable Formal Report Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-900 text-slate-200 space-y-6 print:p-0 print:bg-white print:text-black">
          {/* Institutional Document Header */}
          <div className="border-b-2 border-cyan-500 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-syne font-black text-xl text-white print:text-black">
                  FOOTPRINT-X
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 print:border-black print:text-black print:bg-white">
                  FORMAL AUDIT REPORT
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 font-mono mt-1">
                AUTOMATED SURFACE EXPOSURE & DIGITAL FOOTPRINT ANALYZER
              </p>
              <p className="text-xs text-indigo-400 print:text-indigo-800 font-mono font-semibold">
                Academic Laboratory Course: IoTCSBCL704
              </p>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 print:text-slate-700">
              <div><strong>Audit Target:</strong> {target}</div>
              <div><strong>Generated:</strong> {new Date().toUTCString()}</div>
              <div><strong>Investigator:</strong> {studentName} ({rollNumber})</div>
              <div><strong>Lab Batch:</strong> {labBatch}</div>
            </div>
          </div>

          {/* Executive Summary & Risk Gauge */}
          <div className="bg-slate-950 print:bg-slate-100 p-5 rounded-lg border border-slate-800 print:border-slate-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-syne font-bold text-sm text-white print:text-black mb-1">
                  EXECUTIVE SUMMARY & EXPOSURE POSTURE
                </h3>
                <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed max-w-xl">
                  Non-intrusive open-source intelligence (OSINT) assessment was completed for domain{' '}
                  <code className="text-cyan-300 print:text-cyan-800">{target}</code>. Primary host IP is{' '}
                  <code className="text-cyan-300 print:text-cyan-800">{net?.ip_addresses?.[0] || 'Unknown'}</code> located in{' '}
                  {net?.geoip?.city || 'N/A'}, {net?.geoip?.country || 'N/A'} routed via {net?.geoip?.isp || 'ISP'}. Total {subs?.total_found || 0} Certificate Transparency subdomains were discovered, with {subs?.high_risk_subdomains?.length || 0} sensitive development/administrative nodes.
                </p>
              </div>

              <div className="text-center bg-slate-900 print:bg-white p-3 rounded border border-slate-800 print:border-slate-300 shrink-0">
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 uppercase">CVSS Risk Score</span>
                <div className="text-3xl font-mono font-extrabold text-cyan-400 print:text-black">
                  {score}/100
                </div>
                <span className="text-[11px] font-mono font-bold text-rose-400 print:text-red-700">
                  {riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Breakdown Matrix */}
          <div>
            <h3 className="font-syne font-bold text-xs uppercase tracking-wider text-slate-300 print:text-black mb-2">
              1. TECHNICAL RECONNAISSANCE & LABORATORY EXPERIMENT DATA
            </h3>
            <div className="overflow-x-auto border border-slate-800 print:border-slate-300 rounded">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-black border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Lab Experiment</th>
                    <th className="p-2.5">Evaluated Vector</th>
                    <th className="p-2.5">Observed Telemetry</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300 text-slate-300 print:text-black">
                  <tr>
                    <td className="p-2.5 font-bold">Exp 1</td>
                    <td className="p-2.5">DNS & GeoIP Mapping</td>
                    <td className="p-2.5">{net?.ip_addresses?.[0] || 'N/A'} ({net?.geoip?.country || 'N/A'})</td>
                    <td className="p-2.5 text-emerald-400 print:text-green-800 font-semibold">PASS</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Exp 2</td>
                    <td className="p-2.5">Subdomain CT Enumeration</td>
                    <td className="p-2.5">{subs?.total_found || 0} Subdomains ({subs?.high_risk_subdomains?.length || 0} Sensitive)</td>
                    <td className="p-2.5 text-emerald-400 print:text-green-800 font-semibold">PASS</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Exp 5</td>
                    <td className="p-2.5">Server Banner Grabbing</td>
                    <td className="p-2.5">{web?.server_header || 'Hidden'}</td>
                    <td className="p-2.5 text-emerald-400 print:text-green-800 font-semibold">AUDITED</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Exp 6</td>
                    <td className="p-2.5">Security Headers Audit</td>
                    <td className="p-2.5">
                      HSTS: {web?.security_headers?.strict_transport_security?.present ? 'Enforced' : 'MISSING'} | 
                      CSP: {web?.security_headers?.content_security_policy?.present ? 'Enforced' : 'MISSING'}
                    </td>
                    <td className="p-2.5 text-amber-400 print:text-amber-800 font-semibold">EVALUATED</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Exp 7</td>
                    <td className="p-2.5">Identity Correlation</td>
                    <td className="p-2.5">{idData?.match_count || 0} Public Profiles Identified</td>
                    <td className="p-2.5 text-emerald-400 print:text-green-800 font-semibold">CORRELATED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Vulnerability Findings and Remediation Roadmap */}
          <div>
            <h3 className="font-syne font-bold text-xs uppercase tracking-wider text-slate-300 print:text-black mb-2">
              2. SECURITY DEFICIENCIES & ACTIONABLE REMEDIATION ROADMAP
            </h3>
            <div className="space-y-3">
              {findings.map((f, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded font-mono text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100 print:text-black">
                      {i + 1}. [{f.severity} / CVSS {f.cvss}] {f.title}
                    </span>
                    <span className="text-[10px] text-cyan-400 print:text-cyan-800">{f.category}</span>
                  </div>
                  <p className="text-slate-400 print:text-slate-700 text-[11px] mb-2">{f.impact}</p>
                  <div className="p-2 bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 text-emerald-300 print:text-green-900 text-[11px] rounded">
                    <strong>Action:</strong> {f.remediation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Evaluator Signoff Signature Block */}
          <div className="pt-8 border-t border-slate-800 print:border-slate-400 mt-8 grid grid-cols-2 gap-8 text-xs font-mono">
            <div>
              <p className="text-slate-400 print:text-slate-600 mb-10">STUDENT DECLARATION:</p>
              <div className="border-t border-slate-700 print:border-black pt-1">
                <p className="font-bold text-slate-200 print:text-black">{studentName}</p>
                <p className="text-slate-400 print:text-slate-600">{rollNumber} | {labBatch}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-400 print:text-slate-600 mb-10">LAB EVALUATOR / FACULTY SIGNOFF:</p>
              <div className="border-t border-slate-700 print:border-black pt-1">
                <p className="font-bold text-slate-200 print:text-black">Internal Examiner Signature</p>
                <p className="text-slate-400 print:text-slate-600">Course Coordinator (IoTCSBCL704)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
